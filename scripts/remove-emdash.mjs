import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const tracked = execSync("git ls-files", { encoding: "utf8" });
const untracked = execSync("git ls-files --others --exclude-standard", { encoding: "utf8" });
const files = (tracked + "\n" + untracked)
  .split("\n")
  .map((f) => f.trim())
  .filter(Boolean)
  .filter((f) => !f.startsWith("scripts/remove-emdash"));

let changed = 0;
let total = 0;
for (const f of files) {
  let text;
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  if (!text.includes("\u2014")) continue;
  const before = text;
  text = text.replace(/ \u2014 /g, " - ");
  text = text.replace(/\u2014/g, "-");
  if (text !== before) {
    writeFileSync(f, text);
    changed++;
    total += (before.match(/\u2014/g) || []).length;
    console.log(`fixed ${f}`);
  }
}
console.log(`\nreplaced ${total} em-dashes across ${changed} files`);
