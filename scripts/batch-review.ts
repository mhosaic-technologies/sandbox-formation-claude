import { query } from "@anthropic-ai/claude-code-sdk";
import { execSync } from "child_process";
async function main() {
  const files = execSync("git diff --name-only HEAD~1").toString().trim().split("\n").filter(f => f.endsWith(".ts"));
  for (const file of files) {
    console.log(`Reviewing: ${file}`);
    for await (const msg of query({ prompt: `Review ${file}: security, quality, performance.`, options: { allowedTools: ["Read", "Grep"] } })) {
      if (msg.type === "result" && msg.subtype === "success") console.log(msg.result);
    }
  }
}
main().catch(console.error);
