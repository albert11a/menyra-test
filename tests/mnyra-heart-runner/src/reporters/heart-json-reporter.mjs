import fs from "node:fs/promises";

export async function writeHeartReport({ report, outputFile }) {
  await fs.writeFile(outputFile, JSON.stringify(report, null, 2), "utf8");
  return outputFile;
}
