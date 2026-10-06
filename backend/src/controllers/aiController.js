import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import Problem from "../models/Problem.js";
import AIPrompt from "../models/aiPrompt.js";

import { generateAIHint } from "../services/aiService.js";

import { getAttemptDeadline } from "../utils/getAttemptDeadline.js";

export const askAI = async (req, res) => {
  try {

    const { testId, problemId, prompt, code = "" } = req.body;

    if (!testId || !problemId || !prompt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Test ID, problem ID and prompt are required",
      });
    }

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // ========================================
    // CHECK ACTIVE ATTEMPT
    // ========================================

    const attempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active test attempt not found",
      });
    }

    // ========================================
    // TIMER CHECK
    // ========================================

    const deadline = getAttemptDeadline(attempt, test);

    const now = new Date();

    if (now >= deadline) {
      attempt.status = "expired";
      attempt.submittedAt = now;

      await attempt.save();

      return res.status(403).json({
        success: false,
        message: "Test time has expired",
      });
    }

    // ========================================
    // AI ENABLED CHECK
    // ========================================

    if (test.aiEnabled === false) {
      return res.status(403).json({
        success: false,
        message: "AI assistance is disabled for this test",
      });
    }

    // ========================================
    // AI PROMPT LIMIT
    // ========================================

    const maxAIPrompts = Number(test.maxAIPrompts ?? 0);

    const promptsUsed = Number(attempt.aiPromptsUsed ?? 0);

    if (maxAIPrompts <= 0 || promptsUsed >= maxAIPrompts) {
      return res.status(403).json({
        success: false,
        message: "AI prompt limit reached",
        promptsUsed,
        promptsRemaining: 0,
      });
    }

    // ========================================
    // FIND PROBLEM
    // ========================================

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const belongsToTest = test.problems?.some(
      (item) => String(item?.problem ?? item) === String(problemId),
    );

    if (!belongsToTest) {
      return res.status(403).json({
        success: false,
        message: "Problem does not belong to this test",
      });
    }

    // ========================================
    // GENERATE REAL AI RESPONSE
    // ========================================

    const answer = await generateAIHint({
      problem,
      prompt: prompt.trim(),
      code: code || "",
    });

    // ========================================
    // PROMPT NUMBER
    // ========================================

    const promptNumber = promptsUsed + 1;

    // ========================================
    // SAVE AI HISTORY
    // ========================================

    const aiPrompt = await AIPrompt.create({
      test: test._id,

      attempt: attempt._id,
      student: req.user._id,
      problem: problem._id,
      prompt: prompt.trim(),
      code: code || "",
      response: answer,
      promptNumber,
    });

    // ========================================
    // UPDATE AI USAGE
    // ========================================

    attempt.aiPromptsUsed = promptNumber;

    await attempt.save();

    // ========================================
    // CALCULATE REMAINING PROMPTS
    // ========================================

    const promptsRemaining = Math.max(0, maxAIPrompts - promptNumber);

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      message: "AI hint generated successfully",
      answer,
      promptNumber,
      promptsUsed: promptNumber,
      promptsRemaining,
      aiPromptId: aiPrompt._id,
      deadline,
    });
  } catch (error) {
    console.error("========== HF ERROR ==========");

    console.error("Status:", error?.httpResponse?.status);

    console.error("Body:", JSON.stringify(error?.httpResponse?.body, null, 2));

    console.error("Request ID:", error?.httpResponse?.requestId);

    console.error("==============================");

    throw error;
  }
};

// ==========================================
// GET MY AI HISTORY
// ==========================================

export const getMyAIHistory = async (req, res) => {
  try {
    const { testId, problemId } = req.query;

    const filter = {
      student: req.user._id,
    };

    if (testId) {
      filter.test = testId;
    }

    if (problemId) {
      filter.problem = problemId;
    }

    // ========================================
    // FETCH AI HISTORY
    // ========================================

    const history = await AIPrompt.find(filter)
      .populate("problem", "title slug difficulty topic")
      .populate("test", "title")
      .sort({
        createdAt: 1,
      });
    return res.status(200).json({
      success: true,

      count: history.length,

      history,
    });
  } catch (error) {
    console.error("GET AI HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch AI history",

      error: error.message,
    });
  }
};
