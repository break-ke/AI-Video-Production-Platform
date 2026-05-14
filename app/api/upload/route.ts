import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "未上传视频文件" }, { status: 400 });
    }

    // Validate by extension (browsers may send unreliable MIME types)
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["mp4", "mov", "webm", "avi"].includes(ext)) {
      return NextResponse.json(
        { success: false, error: `不支持的文件格式: .${ext}，请上传 MP4/MOV/WebM` },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "视频文件不能超过100MB" }, { status: 400 });
    }

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "mp4";
    const fileName = `video_${timestamp}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return the public URL
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const videoUrl = `${protocol}://${host}/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        videoUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
