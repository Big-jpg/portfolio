import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_PATH = path.resolve("client", "src", "data", "repos.json");
const OUTPUT_PATH = path.resolve(
  "client",
  "src",
  "data",
  "repo-summaries.json"
);

async function main() {
  const source = JSON.parse(await fs.readFile(SOURCE_PATH, "utf8")) as unknown;

  if (!Array.isArray(source)) {
    throw new Error(`${SOURCE_PATH} must contain a JSON array.`);
  }

  const summaries = source.map((repo, index) => {
    if (repo === null || typeof repo !== "object" || Array.isArray(repo)) {
      throw new Error(`Repository at index ${index} must be a JSON object.`);
    }

    const summary = { ...(repo as Record<string, unknown>) };
    delete summary.readme;
    return summary;
  });

  await fs.writeFile(
    OUTPUT_PATH,
    `${JSON.stringify(summaries, null, 2)}\n`,
    "utf8"
  );
  console.log(
    `Wrote ${summaries.length} repository summaries to ${OUTPUT_PATH}.`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
