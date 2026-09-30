import "dotenv/config";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(
  process.env.HF_TOKEN
);

try {
  const response = await client.chatCompletion({
    model: "openai/gpt-oss-120b:fastest",

    messages: [
      {
        role: "user",
        content:
          "Give one short hint for the Two Sum problem. Do not provide code.",
      },
    ],

    max_tokens: 100,
  });

  console.log("SUCCESS:");
  console.log(
    response.choices[0].message.content
  );

} catch (error) {
  console.log("===== HF ERROR =====");

  console.log(
    "STATUS:",
    error?.httpResponse?.status ??
    error?.response?.status
  );

  console.log(
    "BODY:",
    JSON.stringify(
      error?.httpResponse?.body ??
      error?.response?.body,
      null,
      2
    )
  );

  console.log(
    "MESSAGE:",
    error?.message
  );
}