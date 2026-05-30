import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const skillsPath = path.resolve(process.cwd(), "..", "..", "skills.md");
    const content = await readFile(skillsPath, "utf8");

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'inline; filename="skills.md"',
      },
    });
  } catch (error) {
    console.error("Failed to read skills.md:", error);
    return NextResponse.json(
      { error: "Unable to load skills guide" },
      { status: 500 },
    );
  }
}
