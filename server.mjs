import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const progressFilePath = path.resolve(
  process.env.WFRP_PROGRESS_FILE ?? path.join(__dirname, "data", "character-progress.json"),
);

async function ensureProgressFile() {
  await fs.mkdir(path.dirname(progressFilePath), { recursive: true });

  try {
    await fs.access(progressFilePath);
  } catch {
    await fs.writeFile(progressFilePath, "{}\n", "utf8");
  }
}

async function writeProgressFile(progress) {
  const nextContent = `${JSON.stringify(progress, null, 2)}\n`;
  await ensureProgressFile();

  const currentContent = await fs.readFile(progressFilePath, "utf8");

  if (currentContent === nextContent) {
    return;
  }

  await fs.writeFile(progressFilePath, nextContent, "utf8");
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/character-progress", async (_req, res, next) => {
  try {
    await ensureProgressFile();
    res.type("application/json").send(await fs.readFile(progressFilePath, "utf8"));
  } catch (error) {
    next(error);
  }
});

app.put("/api/character-progress", async (req, res, next) => {
  try {
    await writeProgressFile(req.body ?? {});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use(
  express.static(path.join(__dirname, "dist"), {
    index: false,
    maxAge: "1d",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
        return;
      }

      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.get("*", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`WFRP Sheet server listening on port ${port}`);
});
