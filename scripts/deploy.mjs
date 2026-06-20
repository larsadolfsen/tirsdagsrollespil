import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const railwayCommand = isWindows ? "railway.cmd" : "railway";
const railwayArgs = ["up", ...process.argv.slice(2)];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const railwayCheck = spawnSync(railwayCommand, ["--version"], {
  stdio: "ignore",
  shell: false,
});

if (railwayCheck.error?.code === "ENOENT" || railwayCheck.status !== 0) {
  console.error(
    [
      "Railway CLI was not found on PATH.",
      "",
      "Install it, then link this project before deploying:",
      "  npm install -g @railway/cli",
      "  railway login",
      "  railway link",
      "",
      "Then run:",
      "  npm run deploy",
    ].join("\n"),
  );
  process.exit(1);
}

run(npmCommand, ["run", "build"]);
run(railwayCommand, railwayArgs);
