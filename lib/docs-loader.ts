import { promises as fs } from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "ids-docs");

export async function loadMarkdownFile(
  filename: string
): Promise<string | null> {
  try {
    const filePath = path.join(DOCS_DIR, filename);
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error loading markdown file ${filename}:`, error);
    return null;
  }
}

export async function getAllMarkdownFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(DOCS_DIR);
    return files.filter((file) => file.endsWith(".md"));
  } catch (error) {
    console.error("Error reading docs directory:", error);
    return [];
  }
}
