import { initAcost, trackOpenAI } from "../src/index";

console.log("====================================================");
console.log("  acost — E2E Telemetry Pipeline Verification Test");
console.log("====================================================");

// Parse command line arguments (e.g., --model=gpt-4o --api-key=acost_xxx --api-url=...)
const getArgValue = (flag: string): string | null => {
  const arg = process.argv.find((a) => a.startsWith(`${flag}=`));
  return arg ? arg.split("=")[1] : null;
};

// 1. Initialize the SDK
const testApiKey = getArgValue("--api-key") || process.env.ACOST_API_KEY || "acost_testkey123";
const testApiUrl = getArgValue("--api-url") || process.env.ACOST_API_URL || "http://127.0.0.1:3000";
const chosenModel = getArgValue("--model") || process.env.ACOST_TEST_MODEL || "gpt-4o-mini";

console.log(`Configuring SDK context:`);
console.log(`- API Key: ${testApiKey}`);
console.log(`- API URL: ${testApiUrl}`);
console.log(`- Chosen Model: ${chosenModel}\n`);

initAcost({
  apiKey: testApiKey,
  apiUrl: testApiUrl,
});

// 2. Define a Mock OpenAI request (bypasses live billing requirement for local verification)
const executeMockOpenAIRequest = async () => {
  console.log(`1. SDK Interceptor: Executing mock OpenAI request using model: ${chosenModel}...`);
  // Simulate 350ms network delay
  await new Promise((resolve) => setTimeout(resolve, 350));
  
  return {
    id: "chatcmpl-mock-998877",
    model: chosenModel,
    usage: {
      prompt_tokens: 280,
      completion_tokens: 120,
      total_tokens: 400,
    },
    choices: [
      {
        message: {
          role: "assistant",
          content: `Telemetry ingestion for ${chosenModel} is operating perfectly!`,
        },
      },
    ],
  };
};

async function executeVerificationPipeline() {
  try {
    console.log("2. SDK Interceptor: Triggering trackOpenAI completion wrapper...");
    
    // Execute OpenAI tracking wrapper
    const result = await trackOpenAI({
      feature: "auth-validation",
      userId: "user_developer_test",
      completion: executeMockOpenAIRequest,
    });

    console.log(`3. Client Application: Received completion payload directly:`);
    console.log(`   - Model: ${result.model}`);
    console.log(`   - Output Content: "${result.choices[0].message.content}"`);
    console.log(`   - Total Tokens: ${result.usage.total_tokens} (${result.usage.prompt_tokens} in / ${result.usage.completion_tokens} out)\n`);

    console.log("4. SDK Queue: Asynchronous background thread started. Ingestion queue is flushing...");
    console.log("   Waiting 4 seconds to let the async fetch request complete...");
    
    await new Promise((resolve) => setTimeout(resolve, 4000));
    
    console.log("\n====================================================");
    console.log("  E2E Telemetry verification run completed!");
    console.log("  Check your acost dashboard for verification results.");
    console.log("====================================================");
  } catch (error) {
    console.error("\n[!] Telemetry verification failed:", error);
  }
}

executeVerificationPipeline();
