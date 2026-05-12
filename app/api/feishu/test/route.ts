import { NextResponse } from "next/server";
import { getTenantAccessToken } from "@/lib/feishu/auth";

export async function GET() {
  try {
    const token = await getTenantAccessToken();
    return NextResponse.json({
      success: true,
      tokenPrefix: token.substring(0, 10) + "...",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
