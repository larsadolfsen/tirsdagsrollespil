import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const progressFilePath = path.resolve(
  process.env.WFRP_PROGRESS_FILE ?? path.join(__dirname, "data", "character-progress.json"),
);

function ensureProgressFile() {
  fs.mkdirSync(path.dirname(progressFilePath), { recursive: true });

  if (!fs.existsSync(progressFilePath)) {
    fs.writeFileSync(progressFilePath, "{}\n", "utf8");
  }
}

function writeProgressFile(progress) {
  const nextContent = `${JSON.stringify(progress, null, 2)}\n`;
  ensureProgressFile();

  if (fs.readFileSync(progressFilePath, "utf8") === nextContent) {
    return;
  }

  fs.writeFileSync(progressFilePath, nextContent, "utf8");
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/character-progress", (_req, res) => {
  ensureProgressFile();
  res.type("application/json").send(fs.readFileSync(progressFilePath, "utf8"));
});

app.put("/api/character-progress", (req, res) => {
  writeProgressFile(req.body ?? {});
  res.status(204).end();
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`WFRP Sheet server listening on port ${port}`);
});
