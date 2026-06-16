import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph } from "docx";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;

function wrapLine(
  line: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  maxWidth: number
): string[] {
  if (line.length === 0) return [""];

  const words = line.split(" ");
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, FONT_SIZE) > maxWidth && current) {
      wrapped.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) wrapped.push(current);
  return wrapped;
}

export async function generateResultPdf(text: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  const sourceLines = text.split("\n");
  const lines: string[] = [];
  for (const sourceLine of sourceLines) {
    lines.push(...wrapLine(sourceLine, font, maxWidth));
  }

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of lines) {
    if (y < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }

    page.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });

    y -= LINE_HEIGHT;
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

export async function generateResultDocx(text: string): Promise<Buffer> {
  const paragraphs = text
    .split("\n")
    .map((line) => new Paragraph(line));

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function uploadResultFiles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  caseId: string,
  finalText: string
): Promise<{ pdfPath: string; docxPath: string }> {
  const [pdfBytes, docxBytes] = await Promise.all([
    generateResultPdf(finalText),
    generateResultDocx(finalText),
  ]);

  const pdfPath = `${userId}/${caseId}/result.pdf`;
  const docxPath = `${userId}/${caseId}/result.docx`;

  const [pdfUpload, docxUpload] = await Promise.all([
    supabase.storage.from("results").upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    }),
    supabase.storage.from("results").upload(docxPath, docxBytes, {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: true,
    }),
  ]);

  if (pdfUpload.error) throw pdfUpload.error;
  if (docxUpload.error) throw docxUpload.error;

  return { pdfPath, docxPath };
}

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export async function getResultSignedUrls(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  pdfPath: string | null,
  docxPath: string | null
): Promise<{ pdfUrl: string | null; docxUrl: string | null }> {
  const [pdfResult, docxResult] = await Promise.all([
    pdfPath
      ? supabase.storage.from("results").createSignedUrl(pdfPath, SIGNED_URL_TTL)
      : Promise.resolve(null),
    docxPath
      ? supabase.storage.from("results").createSignedUrl(docxPath, SIGNED_URL_TTL)
      : Promise.resolve(null),
  ]);

  return {
    pdfUrl: pdfResult?.data?.signedUrl ?? null,
    docxUrl: docxResult?.data?.signedUrl ?? null,
  };
}
