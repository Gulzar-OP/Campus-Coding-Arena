import Problem from "../models/Problem.js";
import createSlug from "../utils/createSlug.js";


// ==============================
// CREATE PROBLEM
// ==============================

export const createProblem = async (req, res) => {
  try {
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
      companies,
      testCases,
      timeLimit,
      memoryLimit,
    } = req.body;

    if (!title || !topic || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title, topic and description are required",
      });
    }

    const slug = createSlug(title);

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

    const problem =
      await Problem.create({
        title,
        slug,
        topic,
        difficulty,
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

        createdBy: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Problem created successfully",
      problem,
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
      error: error.message,
    });
  }
};


// ==============================
// GET ALL PROBLEMS
// ==============================

export const getAllProblems = async (
  req,
  res,
) => {
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
      filter.difficulty =
        difficulty;
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

    const currentPage =
      Math.max(Number(page), 1);

    const pageLimit =
      Math.max(Number(limit), 1);

    const skip =
      (currentPage - 1) *
      pageLimit;

    const problems =
      await Problem.find(filter)

        // important:
        // hidden testcase frontend ko mat bhejo
        .select("-testCases")

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(pageLimit);

    const total =
      await Problem.countDocuments(
        filter,
      );

    return res.status(200).json({
      success: true,

      total,

      page: currentPage,

      limit: pageLimit,

      totalPages:
        Math.ceil(
          total / pageLimit,
        ),

      problems,
    });
  } catch (error) {
    console.error(
      "GET PROBLEMS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch problems",
      error: error.message,
    });
  }
};


// ==============================
// GET SINGLE PROBLEM
// ==============================

export const getProblemBySlug = async (
  req,
  res,
) => {
  try {
    const {
      slug,
    } = req.params;

    const problem =
      await Problem.findOne({
        slug,
        isActive: true,
      });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
      });
    }

    const problemObject =
      problem.toObject();

    // student ko sirf visible testcase
    problemObject.testCases =
      problem.testCases.filter(
        (testCase) =>
          !testCase.isHidden,
      );

    return res.status(200).json({
      success: true,
      problem:
        problemObject,
    });
  } catch (error) {
    console.error(
      "GET PROBLEM ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch problem",
      error: error.message,
    });
  }
};


// ==============================
// GET PROBLEM BY ID
// ==============================

export const getProblemById = async (
  req,
  res,
) => {
  try {
    const problem =
      await Problem.findById(
        req.params.id,
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
      });
    }

    const problemObject =
      problem.toObject();

    problemObject.testCases =
      problem.testCases.filter(
        (testCase) =>
          !testCase.isHidden,
      );

    return res.status(200).json({
      success: true,
      problem:
        problemObject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch problem",
      error: error.message,
    });
  }
};


// ==============================
// UPDATE PROBLEM
// ==============================

export const updateProblem = async (
  req,
  res,
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
      });
    }

    const allowedFields = [
      "title",
      "topic",
      "difficulty",
      "description",
      "tags",
      "languages",
      "inputFormat",
      "outputFormat",
      "constraints",
      "companies",
      "testCases",
      "timeLimit",
      "memoryLimit",
      "isActive",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          problem[field] =
            req.body[field];
        }
      },
    );

    if (req.body.title) {
      const newSlug =
        createSlug(
          req.body.title,
        );

      const duplicate =
        await Problem.findOne({
          slug: newSlug,
          _id: {
            $ne: problem._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another problem with this title already exists",
        });
      }

      problem.slug =
        newSlug;
    }

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


// ==============================
// DELETE PROBLEM
// ==============================

export const deleteProblem = async (
  req,
  res,
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
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