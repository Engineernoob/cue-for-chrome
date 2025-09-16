/**
 * Wrappers for Chrome’s built-in AI APIs (Gemini Nano in Canary).
 * Supports Summarizer, Proofreader, Rewriter, Translator, Writer, and Prompt API fallback.
 */

export interface AIResponse {
  text: string;
  error?: string;
  modelUsed?: string;
}

const MODEL = "gemini-nano";

/**
 * Core Prompt API fallback wrapper
 */
async function executePrompt(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  const ai = (window as any).ai;
  if (!ai?.prompt?.execute) {
    return {
      text: "",
      error:
        "Prompt API not available. Enable chrome://flags/#prompt-api-web and #optimization-guide-on-device-model",
    };
  }

  try {
    const result = await ai.prompt.execute({
      prompt,
      model: MODEL,
      maxTokens: options?.maxTokens || 512,
      temperature: options?.temperature ?? 0.7,
    });
    return { text: result.response, modelUsed: MODEL };
  } catch (error) {
    console.error("Prompt execution error:", error);
    return { text: "", error: "Prompt API failed - check Chrome flags" };
  }
}

/**
 * Summarizer
 */
export async function summarizeText(
  input: string,
  mode: "interview" | "coding_test" | "meeting" | "general" = "general"
): Promise<AIResponse> {
  const ai = (window as any).ai;
  if (!ai?.summarizer?.create) {
    // fallback
    const prompt = `Summarize this text for ${mode} context:\n\n${input}`;
    return executePrompt(prompt);
  }

  try {
    const session = await ai.summarizer.create({ type: "key-points" });
    const result = await session.summarize(input);
    await session.destroy?.();
    return { text: result, modelUsed: MODEL };
  } catch (error) {
    console.error("Summarization error:", error);
    return { text: "", error: "Summarizer API failed" };
  }
}

/**
 * Proofreader
 */
export async function proofreadText(input: string): Promise<AIResponse> {
  const ai = (window as any).ai;
  if (!ai?.proofreader?.create) {
    const prompt = `Proofread and correct the following text:\n\n${input}`;
    return executePrompt(prompt);
  }

  try {
    const session = await ai.proofreader.create();
    const result = await session.proofread(input);
    await session.destroy?.();
    return { text: result, modelUsed: MODEL };
  } catch (error) {
    console.error("Proofreading error:", error);
    return { text: "", error: "Proofreader API failed" };
  }
}

/**
 * Rewriter
 */
export async function rewriteText(
  input: string,
  tone: "concise" | "formal" | "persuasive" = "concise"
): Promise<AIResponse> {
  const ai = (window as any).ai;
  if (!ai?.rewriter?.create) {
    const prompt = `Rewrite the following text in a ${tone} tone:\n\n${input}`;
    return executePrompt(prompt);
  }

  try {
    const session = await ai.rewriter.create({ tone });
    const result = await session.rewrite(input, { tone });
    await session.destroy?.();
    return { text: result, modelUsed: MODEL };
  } catch (error) {
    console.error("Rewriting error:", error);
    return { text: "", error: "Rewriter API failed" };
  }
}

/**
 * Translator
 */
export async function translateText(
  input: string,
  targetLanguage: string = "es"
): Promise<AIResponse> {
  const ai = (window as any).ai;
  if (!ai?.translator?.create) {
    const prompt = `Translate this text to ${targetLanguage}:\n\n${input}`;
    return executePrompt(prompt);
  }

  try {
    const session = await ai.translator.create({ to: targetLanguage });
    const result = await session.translate(input);
    await session.destroy?.();
    return { text: result, modelUsed: MODEL };
  } catch (error) {
    console.error("Translation error:", error);
    return { text: "", error: "Translator API failed" };
  }
}

/**
 * Writer (text generation)
 */
export async function generateText(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  const ai = (window as any).ai;
  if (!ai?.writer?.create) {
    return executePrompt(prompt, options);
  }

  try {
    const session = await ai.writer.create();
    const result = await session.write(prompt);
    await session.destroy?.();
    return { text: result, modelUsed: MODEL };
  } catch (error) {
    console.error("Writer error:", error);
    return { text: "", error: "Writer API failed" };
  }
}

/**
 * Utility: Check if AI APIs are available
 */
export function isAIAvailable(): boolean {
  const ai = (window as any).ai;
  return !!(
    ai &&
    (ai.summarizer ||
      ai.proofreader ||
      ai.rewriter ||
      ai.translator ||
      ai.writer ||
      ai.prompt)
  );
}
