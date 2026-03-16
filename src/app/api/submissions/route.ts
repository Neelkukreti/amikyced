import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions } from "@/lib/submission-store";

/** GET /api/submissions?secret=xxx — export all submissions for sync */
export async function GET(req: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET || "";
  const secret = req.nextUrl.searchParams.get("secret");
  if (!syncSecret || secret !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = getAllSubmissions();
  return NextResponse.json({ submissions, count: submissions.length });
}
