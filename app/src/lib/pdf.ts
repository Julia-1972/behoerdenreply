// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import { getOpenAI } from "./openai";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

export async function extractPdfTextOcr(buffer: Buffer): Promise<string> {
  const openai = getOpenAI();

  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const uploadedFile = await openai.files.create({
    file: new File([arrayBuffer], "document.pdf", { type: "application/pdf" }),
    purpose: "user_data",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { type: "file", file: { file_id: uploadedFile.id } } as never,
          { type: "text", text: "Lies dieses Behördenschreiben vollständig und gib den gesamten Text zurück. Nur der Text, keine Kommentare." },
        ],
      }],
      max_tokens: 4000,
    });
    return response.choices[0]?.message?.content ?? "";
  } finally {
    await openai.files.delete(uploadedFile.id).catch(() => {});
  }
}
