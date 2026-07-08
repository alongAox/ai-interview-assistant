import { NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ai/analyze-resume";
import { extractTextFromPdf } from "@/lib/pdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "未找到上传的文件" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "仅支持 PDF 文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractTextFromPdf(buffer);
    const analysis = await analyzeResume(resumeText);

    return NextResponse.json({
      fileName: file.name,
      ...analysis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "分析失败，请稍后重试";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
