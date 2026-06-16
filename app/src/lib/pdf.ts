import path from "path";
import { PDFParse } from "pdf-parse";

const workerSrc = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
);

PDFParse.setWorker(`file://${workerSrc.replace(/\\/g, "/")}`);

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}
