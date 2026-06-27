import fs from "node:fs";
import path from "node:path";

const sourceDirectory = path.resolve("src");
const headingComponentPath = path.resolve("src/components/ui/Heading.tsx");
const violations = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      visit(entryPath);
      continue;
    }

    if (!entry.name.endsWith(".tsx")) {
      continue;
    }

    const source = fs.readFileSync(entryPath, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (/<h[1-6](?:\s|>)/.test(line)) {
        violations.push(
          `${path.relative(process.cwd(), entryPath)}:${index + 1} uses a raw heading; use the shared Heading component.`,
        );
      }
    });
  }
}

visit(sourceDirectory);

const headingComponentSource = fs.readFileSync(headingComponentPath, "utf8");
if (/text-wfrp-gold/.test(headingComponentSource)) {
  violations.push(
    `${path.relative(process.cwd(), headingComponentPath)} gives a heading variant a gold text color.`,
  );
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Typography check passed.");
}
