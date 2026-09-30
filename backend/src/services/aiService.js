import { InferenceClient } from "@huggingface/inference";

// ==========================================
// HUGGING FACE CLIENT
// ==========================================

if (!process.env.HF_TOKEN) {
  console.warn(
    "HF_TOKEN is not configured"
  );
}

const hf = new InferenceClient(
  process.env.HF_TOKEN
);

// ==========================================
// AI MODEL
// ==========================================

// Hugging Face currently lists this as a
// conversational/instruction model.
const AI_MODEL =
  "openai/gpt-oss-120b:fastest";

// ==========================================
// GENERATE AI HINT
// ==========================================

export const generateAIHint = async ({
  problem,
  prompt,
  code = "",
}) => {
  try {

    // ========================================
    // VALIDATION
    // ========================================

    if (!problem) {
      throw new Error(
        "Problem information is required"
      );
    }

    if (!prompt?.trim()) {
      throw new Error(
        "AI prompt is required"
      );
    }

    if (!process.env.HF_TOKEN) {
      throw new Error(
        "HF_TOKEN is not configured"
      );
    }

    // ========================================
    // SYSTEM PROMPT
    // ========================================

    const systemPrompt = `
You are an AI coding assistant inside a timed
coding assessment platform called Campus Coding Arena.

Your job is to help students understand coding
problems without giving them the complete solution.

STRICT RULES:

1. Give hints, not complete solutions.

2. Do NOT provide complete ready-to-submit code.

3. Do NOT reveal the full optimal solution immediately.

4. Help the student think step by step.

5. You may suggest:
   - suitable data structures
   - algorithms
   - time complexity improvements
   - debugging hints
   - logical mistakes
   - edge cases

6. If student provides code:
   - analyze their code
   - identify the likely problem
   - explain the issue
   - give hints for fixing it
   - do not rewrite the entire solution

7. If student asks directly for the complete answer,
politely refuse to provide the full solution and
give a useful hint instead.

8. Do not reveal hidden test cases.

9. Do not invent test cases that are claimed to
come from the assessment.

10. Keep answers concise because this is a timed
coding assessment.

11. If the student asks in Hinglish, answer in
simple Hinglish.

12. If the student asks in English, answer in
English.

Your goal is to behave like an interview mentor,
not a solution generator.
`;

    // ========================================
    // PROBLEM CONTEXT
    // ========================================

    const constraints =
      Array.isArray(problem.constraints)
        ? problem.constraints.join("\n")
        : problem.constraints || "Not provided";

    const tags =
      Array.isArray(problem.tags)
        ? problem.tags.join(", ")
        : problem.tags || "Not provided";

    const studentCode =
      code?.trim()
        ? code
        : "Student has not written code yet.";

    // IMPORTANT:
    // Hidden testcases intentionally NOT sent to AI.

    const userPrompt = `
CODING PROBLEM CONTEXT

Title:
${problem.title}

Topic:
${problem.topic}

Difficulty:
${problem.difficulty}

Tags:
${tags}

Description:
${problem.description}

Input Format:
${problem.inputFormat || "Not provided"}

Output Format:
${problem.outputFormat || "Not provided"}

Constraints:
${constraints}


STUDENT'S CURRENT CODE

${studentCode}


STUDENT'S QUESTION

${prompt.trim()}


Give a helpful hint according to the assessment rules.
`;

    // ========================================
    // HUGGING FACE REQUEST
    // ========================================

    console.log(
      `🤖 Sending AI request for: ${problem.title}`
    );

    const response =
    await hf.chatCompletion({
        model: AI_MODEL,

        messages: [
        {
            role: "system",
            content: systemPrompt,
        },
        {
            role: "user",
            content: userPrompt,
        },
        ],

        max_tokens: 350,
        temperature: 0.3,
    });

    // ========================================
    // EXTRACT RESPONSE
    // ========================================

    const answer =
      response?.choices?.[0]
        ?.message?.content?.trim();

    if (!answer) {
      console.error(
        "HF RESPONSE:",
        response
      );

      throw new Error(
        "AI returned an empty response"
      );
    }

    console.log(
      `✅ AI response generated for: ${problem.title}`
    );

    return answer;

  } catch (error) {

    // ========================================
    // ERROR HANDLING
    // ========================================

    console.error(
      "HUGGING FACE AI ERROR:",
      error
    );

    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to generate AI hint";

    throw new Error(message);
  }
};