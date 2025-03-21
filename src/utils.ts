import * as glob from "@actions/glob";
import * as defs from "./defs";

export async function matchFiles(patterns: string[]): Promise<string[]> {
  const globber: glob.Globber = await glob.create(patterns.join("\n"));
  const files: string[] = await globber.glob();
  return files;
}
