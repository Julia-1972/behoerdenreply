// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import { openai } from "./openai";

export function isReadableText(text: string): boolean {
  // Real letter content has many actual words with letters
  const words = text.trim().split(/\s+/).filter(
    w => w.length >= 3 && /[a-zA-ZäöüÄÖÜß]{2,}/.test(w)
  );
  return words.length >= 15;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

export async function extractPdfTextOcr(buffer: Buffer): Promise<string> {
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  const uploadedFile = await openai.files.create({
    file: new File([arrayBuffer], "document.pdf", { type: "application/pdf" }),
    purpose: "user_data",
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai as any).responses.create({
      model: "gpt-4o",
      input: [{
        role: "user",
        content: [
          { type: "input_file", file_id: uploadedFile.id },
          {
            type: "input_text",
            text: "Dies ist ein offizielles Schreiben einer deutschen Behoerde. Beschreibe JEDE SEITE separat und vollstaendig. Dann beantworte: 1) Von welcher Behoerde stammt das Schreiben? 2) Was wird gefordert oder mitgeteilt? 3) Welche Fristen oder Daten werden genannt? 4) Welche Betraege, Aktenzeichen oder Paragraphen? 5) Name und Adresse des Empfaengers? 6) Welche konkreten Dokumente oder Nachweise werden angefordert - liste JEDEN einzelnen Punkt auf (z.B. Pass, Arbeitsvertrag, Kontoauszug, Krankenversicherung etc.). Sei maximal detailliert.",
          },
        ],
      }],
    });

    return (response as { output_text?: string }).output_text ?? "";
  } finally {
    await openai.files.delete(uploadedFile.id).catch(() => {});
  }
}
