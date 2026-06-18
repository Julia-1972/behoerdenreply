// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import { openai } from "./openai";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

export async function extractPdfTextOcr(buffer: Buffer): Promise<string> {

  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const uploadedFile = await openai.files.create({
    file: new File([arrayBuffer], "document.pdf", { type: "application/pdf" }),
    purpose: "assistants",
  });

  let assistantId: string | null = null;
  let threadId: string | null = null;

  try {
    const assistant = await openai.beta.assistants.create({
      name: "OCR",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });
    assistantId = assistant.id;

    const thread = await openai.beta.threads.create({
      messages: [{
        role: "user",
        content: "Extrahiere den vollständigen Text aus dem angehängten Dokument. Gib nur den reinen Text aus, keine Kommentare.",
        attachments: [{ file_id: uploadedFile.id, tools: [{ type: "file_search" }] }],
      }],
    });
    threadId = thread.id;

    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    if (run.status !== "completed") throw new Error("OCR run failed");

    const messages = await openai.beta.threads.messages.list(threadId, { order: "desc", limit: 1 });
    const content = messages.data[0]?.content[0];
    if (!content || content.type !== "text") throw new Error("No text in OCR response");
    return content.text.value;

  } finally {
    if (threadId) await openai.beta.threads.delete(threadId).catch(() => {});
    if (assistantId) await openai.beta.assistants.delete(assistantId).catch(() => {});
    await openai.files.delete(uploadedFile.id).catch(() => {});
  }
}
