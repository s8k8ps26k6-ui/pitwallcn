import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".md"]);

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
    })
  );

  return nested.flat();
}

export async function GET() {
  const root = process.cwd();
  const srcRoot = path.join(root, "src");
  const sourceFiles = (await walk(srcRoot)).sort();
  const auditFiles = [
    ...sourceFiles,
    path.join(root, "next.config.mjs"),
    path.join(root, ".env.example")
  ];

  const matches: Array<{ file: string; line: number; text: string }> = [];

  for (const absolutePath of auditFiles) {
    if (!TEXT_EXTENSIONS.has(path.extname(absolutePath)) && !absolutePath.endsWith(".env.example")) continue;

    const content = await readFile(absolutePath, "utf8");
    content.split("\n").forEach((line, index) => {
      if (/api\.openf1\.org|fetchOpenF1|OPENF1_BASE_URL|NEXT_PUBLIC_/.test(line)) {
        matches.push({
          file: path.relative(root, absolutePath),
          line: index + 1,
          text: line.trim()
        });
      }
    });
  }

  return NextResponse.json({
    files: sourceFiles.map((file) => path.relative(root, file)),
    matches
  });
}
