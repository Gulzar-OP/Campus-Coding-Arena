import Problem from "../models/Problem.js";
import createSlug from "../utils/createSlug.js";
import Test from "../models/test.js";

export const createProblem = async (req, res) => {
  try {
    const {
      testId,

      title,
      topic,
      difficulty,
      description,

      tags = [],
      languages = [
        "C++",
        "Java",
        "Python",
      ],

      inputFormat = "",
      outputFormat = "",

      constraints = [],
      companies = [],

      testCases = [],

      timeLimit = 2,
      memoryLimit = 256,

      marks = 10,
    } = req.body;

    // ==============================
    // REQUIRED FIELDS
    // ==============================

    if (
      !title ||
      !topic ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, topic and description are required",
      });
    }

    // ==============================
    // GENERATE SLUG
    // ==============================

    const slug =
      createSlug(title);

    // ==============================
    // CHECK DUPLICATE PROBLEM
    // ==============================

    const existingProblem =
      await Problem.findOne({
        slug,
      });

    if (existingProblem) {
      return res.status(409).json({
        success: false,
        message:
          "Problem with this title already exists",
      });
    }

    // ==============================
    // IF TEST ID PROVIDED
    // CHECK TEST
    // ==============================

    let test = null;

    if (testId) {
      test =
        await Test.findById(
          testId,
        );

      if (!test) {
        return res.status(404).json({
          success: false,
          message:
            "Test not found",
        });
      }

      // Optional:
      // Only creator/admin should modify test

      if (
        String(
          test.createdBy,
        ) !==
          String(
            req.user._id,
          ) &&
        req.user.role !==
          "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot add problems to this test",
        });
      }
    }

    // ==============================
    // CREATE PROBLEM
    // ==============================

    const problem =
      await Problem.create({
        title,
        slug,
        topic,
        difficulty:
          difficulty ||
          "Easy",

        description,

        tags,
        languages,

        inputFormat,
        outputFormat,

        constraints,

        companies,

        testCases,

        timeLimit,
        memoryLimit,

        createdBy:
          req.user._id,
      });

    // ==============================
    // IF TEST ID PROVIDED
    // ADD PROBLEM TO TEST
    // ==============================

    if (test) {
      test.problems.push({
        problem:
          problem._id,

        marks:
          Number(marks) ||
          10,
      });

      await test.save();
    }

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(201).json({
      success: true,

      message:
        test
          ? "Problem created and added to test successfully"
          : "Problem created successfully",

      problem,

      addedToTest:
        Boolean(test),

      testId:
        test?._id || null,
    });
  } catch (error) {
    console.error(
      "CREATE PROBLEM ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create problem",
      error:
        error.message,
    });
  }
};

// GET ALL PROBLEMS
export const getAllProblems = async (req, res) => {
  try {
    const {
      difficulty,
      topic,
      company,
      tag,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (topic) {
      filter.topic = {
        $regex: topic,
        $options: "i",
      };
    }

    if (company) {
      filter.companies = {
        $in: [company],
      };
    }

    if (tag) {
      filter.tags = {
        $in: [tag],
      };
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const currentPage = Math.max(Number(page), 1);

    const pageLimit = Math.max(Number(limit), 1);

    const skip = (currentPage - 1) * pageLimit;

    const problems = await Problem.find(filter)

      // important:
      // hidden testcase frontend ko mat bhejo
      .select("-testCases")

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(pageLimit);

    const total = await Problem.countDocuments(filter);

    return res.status(200).json({
      success: true,

      total,

      page: currentPage,

      limit: pageLimit,

      totalPages: Math.ceil(total / pageLimit),

      problems,
    });
  } catch (error) {
    console.error("GET PROBLEMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};

// GET SINGLE PROBLEM
export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await Problem.findOne({
      slug,
      isActive: true,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const problemObject = problem.toObject();

    // student ko sirf visible testcase
    problemObject.testCases = problem.testCases.filter(
      (testCase) => !testCase.isHidden,
    );

    return res.status(200).json({
      success: true,
      problem: problemObject,
    });
  } catch (error) {
    console.error("GET PROBLEM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};

// GET PROBLEM BY ID
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate(
        "createdBy",
        "name email",
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // const problemObject = problem.toObject();

    // problemObject.testCases = problem.testCases.filter(
    //   (testCase) => !testCase.isHidden,
    // );

    return res.status(200).json({
      success: true,
      // problem: problemObject,
      problem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};

// UPDATE PROBLEM
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      topic,
      difficulty,
      description,
      tags,
      languages,
      inputFormat,
      outputFormat,
      constraints,
      testCases,
      timeLimit,
      memoryLimit,
      companies,
      isActive,
    } = req.body;

    // ==============================
    // FIND PROBLEM
    // ==============================

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ==============================
    // AUTHORIZATION
    // ==============================

    if (
      String(problem.createdBy) !==
        String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this problem",
      });
    }

    // ==============================
    // TITLE + SLUG
    // ==============================

    if (
      title !== undefined &&
      title.trim() !== problem.title
    ) {
      const newSlug = createSlug(
        title.trim(),
      );

      const existingProblem =
        await Problem.findOne({
          slug: newSlug,
          _id: {
            $ne: problem._id,
          },
        });

      if (existingProblem) {
        return res.status(409).json({
          success: false,
          message:
            "Another problem with this title already exists",
        });
      }

      problem.title =
        title.trim();

      problem.slug =
        newSlug;
    }

    // ==============================
    // BASIC FIELDS
    // ==============================

    if (topic !== undefined) {
      if (!topic.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Topic cannot be empty",
        });
      }

      problem.topic =
        topic.trim();
    }

    if (
      difficulty !== undefined
    ) {
      const allowedDifficulties = [
        "Easy",
        "Medium",
        "Hard",
      ];

      if (
        !allowedDifficulties.includes(
          difficulty,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid difficulty value",
        });
      }

      problem.difficulty =
        difficulty;
    }

    if (
      description !== undefined
    ) {
      if (
        !description.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Description cannot be empty",
        });
      }

      problem.description =
        description;
    }

    // ==============================
    // ARRAY FIELDS
    // ==============================

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message:
            "Tags must be an array",
        });
      }

      problem.tags = tags;
    }

    if (
      languages !== undefined
    ) {
      if (
        !Array.isArray(
          languages,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Languages must be an array",
        });
      }

      problem.languages =
        languages;
    }

    if (
      constraints !== undefined
    ) {
      if (
        !Array.isArray(
          constraints,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Constraints must be an array",
        });
      }

      problem.constraints =
        constraints;
    }

    if (
      companies !== undefined
    ) {
      if (
        !Array.isArray(
          companies,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Companies must be an array",
        });
      }

      problem.companies =
        companies;
    }

    // ==============================
    // INPUT / OUTPUT
    // ==============================

    if (
      inputFormat !== undefined
    ) {
      problem.inputFormat =
        inputFormat;
    }

    if (
      outputFormat !== undefined
    ) {
      problem.outputFormat =
        outputFormat;
    }

    // ==============================
    // TEST CASES
    // ==============================

    if (
      testCases !== undefined
    ) {
      if (
        !Array.isArray(
          testCases,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Test cases must be an array",
        });
      }

      for (
        let i = 0;
        i < testCases.length;
        i++
      ) {
        const testCase =
          testCases[i];

        if (
          typeof testCase.input !==
            "string" ||
          !testCase.input.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Test case ${
                i + 1
              }: input is required`,
          });
        }

        if (
          typeof testCase.expectedOutput !==
            "string" ||
          !testCase.expectedOutput.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Test case ${
                i + 1
              }: expected output is required`,
          });
        }
      }

      problem.testCases =
        testCases.map(
          (testCase) => ({
            input:
              testCase.input,

            expectedOutput:
              testCase.expectedOutput,

            isHidden:
              Boolean(
                testCase.isHidden,
              ),
          }),
        );
    }

    // ==============================
    // LIMITS
    // ==============================

    if (
      timeLimit !== undefined
    ) {
      const parsedTimeLimit =
        Number(timeLimit);

      if (
        Number.isNaN(
          parsedTimeLimit,
        ) ||
        parsedTimeLimit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Time limit must be greater than 0",
        });
      }

      problem.timeLimit =
        parsedTimeLimit;
    }

    if (
      memoryLimit !== undefined
    ) {
      const parsedMemoryLimit =
        Number(memoryLimit);

      if (
        Number.isNaN(
          parsedMemoryLimit,
        ) ||
        parsedMemoryLimit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Memory limit must be greater than 0",
        });
      }

      problem.memoryLimit =
        parsedMemoryLimit;
    }

    // ==============================
    // ACTIVE STATUS
    // ==============================

    if (
      isActive !== undefined
    ) {
      problem.isActive =
        Boolean(isActive);
    }

    // ==============================
    // SAVE
    // ==============================

    await problem.save();

    return res.status(200).json({
      success: true,
      message:
        "Problem updated successfully",
      problem,
    });
  } catch (error) {
    console.error(
      "UPDATE PROBLEM ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update problem",
      error: error.message,
    });
  }
};


export const deleteProblem = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
      });
    }

    if (
      String(problem.createdBy) !==
        String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this problem",
      });
    }

    // Check if problem is already used in any test
    const testUsingProblem =
      await Test.findOne({
        "problems.problem": id,
      }).select(
        "_id title status",
      );

    if (testUsingProblem) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this problem because it is already used in a test",
        test: {
          _id:
            testUsingProblem._id,
          title:
            testUsingProblem.title,
          status:
            testUsingProblem.status,
        },
      });
    }

    await Problem.findByIdAndDelete(
      id,
    );

    return res.status(200).json({
      success: true,
      message:
        "Problem deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PROBLEM ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete problem",
      error: error.message,
    });
  }
};
// GET MY PROBLEMS - TEACHER

export const getMyProblems = async (req, res) => {
  try {
    const { difficulty, topic, search, page = 1, limit = 10 } = req.query;

    const filter = {
      createdBy: req.user._id,
      isActive: true,
    };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (topic) {
      filter.topic = {
        $regex: topic,
        $options: "i",
      };
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $in: [new RegExp(search, "i")],
          },
        },
      ];
    }

    const currentPage = Math.max(Number(page) || 1, 1);

    const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const skip = (currentPage - 1) * pageLimit;

    const problems = await Problem.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageLimit)
      .lean();
    const formattedProblems = problems.map((problem) => ({
      ...problem,

      testCaseCount: problem.testCases?.length || 0,

      testCases: undefined,
    }));

    const total = await Problem.countDocuments(filter);

    return res.status(200).json({
      success: true,

      total,

      page: currentPage,

      limit: pageLimit,

      totalPages: Math.ceil(total / pageLimit),

      problems: formattedProblems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your problems",
      error: error.message,
    });
  }
};

// GET MY PROBLEM STATS
export const getMyProblemStats = async (req, res) => {
  try {
    const baseFilter = {
      createdBy: req.user._id,
      isActive: true,
    };

    const [total, easy, medium, hard] = await Promise.all([
      Problem.countDocuments(baseFilter),

      Problem.countDocuments({
        ...baseFilter,
        difficulty: "Easy",
      }),

      Problem.countDocuments({
        ...baseFilter,
        difficulty: "Medium",
      }),

      Problem.countDocuments({
        ...baseFilter,
        difficulty: "Hard",
      }),
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        total,
        easy,
        medium,
        hard,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem stats",
      error: error.message,
    });
  }
};
