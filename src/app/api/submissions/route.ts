import { NextRequest, NextResponse } from "next/server";
import { getSubmissionCount } from "@/lib/submission-store";
import fs from "fs";
import path from "path";

const SYNC_SECRET = process.env.SYNC_SECRET || "";

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

/** GET /api/submissions?secret=xxx — export all submissions for sync */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!SYNC_SECRET || secret !== SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ submissions: [], count: 0 });
    }
    const store = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return NextResponse.json({
      submissions: store.submissions || [],
      count: getSubmissionCount(),
    });
  } catch {
    return NextResponse.json({ submissions: [], count: 0 });
  }
}
