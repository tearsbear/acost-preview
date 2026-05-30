/**
 * acost-sdk
 * Fail-safe, lightweight, async-batched OpenAI tracking SDK for acost.
 */

export interface AcostConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface TrackOptions {
  feature: string;
  userId?: string;
  completion: () => Promise<any>;
}

export interface IngestionEvent {
  feature: string;
  userId?: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  latency: number;
  createdAt: string;
}

// Global state
let globalApiKey: string | undefined = process.env.ACOST_API_KEY;
let globalApiUrl: string = process.env.ACOST_API_URL || "http://127.0.0.1:3000";

/**
 * Initialize the Acost SDK with your API key and options.
 */
export function initAcost(config: AcostConfig) {
  if (!config.apiKey) {
    console.warn("Acost SDK Warning: API key is required but not provided.");
  }
  globalApiKey = config.apiKey;
  if (config.apiUrl) {
    // Strip trailing slash if present
    globalApiUrl = config.apiUrl.replace(/\/$/, "");
  }
}

/**
 * Pricing rates for OpenAI models (per token).
 */
const PRICING_DICT: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.000005, output: 0.000015 },
  "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
  "gpt-4-turbo": { input: 0.00001, output: 0.00003 },
  "gpt-4": { input: 0.00003, output: 0.00006 },
  "gpt-3.5-turbo": { input: 0.0000005, output: 0.0000015 },
  "o1-preview": { input: 0.000015, output: 0.00006 },
  "o1-mini": { input: 0.000003, output: 0.000012 },
};

/**
 * Calculate the cost of the token usage based on the model name.
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const normalizedModel = model.toLowerCase();
  
  // Find matching model rates
  let rates = PRICING_DICT[normalizedModel];
  
  if (!rates) {
    // Try to match prefixes
    const matchedKey = Object.keys(PRICING_DICT).find(key => normalizedModel.startsWith(key));
    if (matchedKey) {
      rates = PRICING_DICT[matchedKey];
    } else {
      // Default fallback (similar to GPT-4-turbo)
      rates = { input: 0.00001, output: 0.00003 };
    }
  }

  return (inputTokens * rates.input) + (outputTokens * rates.output);
}

/**
 * A robust background queue that batches events and handles retries with backoff.
 */
class EventQueue {
  private queue: IngestionEvent[] = [];
  private isProcessing = false;
  private maxBatchSize = 50;
  private retryDelayMs = 5000;
  private maxRetries = 3;

  /**
   * Enqueue a new tracking event.
   */
  enqueue(event: IngestionEvent) {
    this.queue.push(event);
    this.process();
  }

  /**
   * Process the queue in the background.
   */
  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    const apiKey = globalApiKey || process.env.ACOST_API_KEY;
    if (!apiKey) {
      // Fail silently but log warning once
      console.warn("Acost SDK Error: API key is not configured. Tracking event discarded.");
      this.queue = [];
      return;
    }

    this.isProcessing = true;

    // Splice a batch of events
    const batch = this.queue.splice(0, this.maxBatchSize);

    let attempts = 0;
    let success = false;

    while (attempts < this.maxRetries && !success) {
      attempts++;
      try {
        const response = await fetch(`${globalApiUrl}/api/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ events: batch }),
          // Make sure it doesn't block node process exit in script environments
          keepalive: true,
        });

        if (response.ok) {
          success = true;
        } else {
          throw new Error(`HTTP status ${response.status}`);
        }
      } catch (error) {
        if (attempts >= this.maxRetries) {
          console.warn(`Acost SDK Error: Failed to ingest telemetry after ${this.maxRetries} attempts. Events discarded.`, error);
        } else {
          // Wait before retrying (exponential backoff)
          const backoff = this.retryDelayMs * Math.pow(2, attempts - 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    this.isProcessing = false;

    // If it failed, we discard to prevent memory leaks or infinity retry loops, 
    // but in case of network drop, you can choose to put them back.
    // For production safety, we discard to ensure client apps NEVER suffer from memory bloat.

    // Continue processing if queue is not empty
    if (this.queue.length > 0) {
      this.process();
    }
  }
}

// Global queue instance
const eventQueue = new EventQueue();

/**
 * Wrap and track an OpenAI API completion request.
 */
export async function trackOpenAI(options: TrackOptions): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Execute the actual AI completion call
    const result = await options.completion();
    const latency = Date.now() - startTime;

    // Process the results asynchronously and safely
    Promise.resolve().then(() => {
      try {
        const model = result?.model || "unknown";
        const inputTokens = result?.usage?.prompt_tokens ?? 0;
        const outputTokens = result?.usage?.completion_tokens ?? 0;
        const estimatedCost = calculateCost(model, inputTokens, outputTokens);

        const event: IngestionEvent = {
          feature: options.feature,
          userId: options.userId,
          model,
          provider: "openai",
          inputTokens,
          outputTokens,
          estimatedCost,
          latency,
          createdAt: new Date().toISOString(),
        };

        // Queue the event for asynchronous, batched ingestion
        eventQueue.enqueue(event);
      } catch (err) {
        // Fail silently inside the tracking parse
        console.warn("Acost SDK parse warning (silent):", err);
      }
    }).catch((err) => {
      // Double safe catch
      console.warn("Acost SDK promise warning (silent):", err);
    });

    return result;
  } catch (error) {
    // If the original completion fails, propagate the error directly
    throw error;
  }
}
