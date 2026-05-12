import { NextResponse } from "next/server";
import { generateImage, checkBalance } from "@/lib/lingke";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    results.balance = await checkBalance();
  } catch (e) {
    results.balanceError = (e as Error).message;
  }

  try {
    results.imageUrl = await generateImage(
      "doubao-seedream-5-0-260128",
      "A beautiful sunset over mountains, cinematic style",
      { aspect_ratio: "16:9", size: "2K" }
    );
  } catch (e) {
    results.imageError = (e as Error).message;
  }

  return NextResponse.json(results);
}
