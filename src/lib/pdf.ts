import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text.trim();

    if (!text) {
      throw new Error("无法从 PDF 中提取文本，请确认文件不是扫描件");
    }

    return text;
  } finally {
    await parser.destroy();
  }
}
