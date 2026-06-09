import { pagespeedonline } from "@googleapis/pagespeedonline";
import { existsSync, readFileSync } from "node:fs";

const defaultUrl = "https://tirsdagsrollespil-production.up.railway.app/enemy_within/thano_voss";
const envFilePath = new URL("../.env", import.meta.url);
const args = process.argv.slice(2);
const urlArg = args.find((value) => value.startsWith("http://") || value.startsWith("https://"));
const url = urlArg ?? defaultUrl;
const strategies = args.filter((value) => value === "mobile" || value === "desktop");
const selectedStrategies = strategies.length > 0 ? strategies : ["mobile", "desktop"];

if (!url) {
  console.error("Usage: npm run pagespeed -- [url] [mobile] [desktop]");
  process.exit(1);
}

const client = pagespeedonline("v5");

function getEnvValue(key) {
  if (process.env[key]) {
    return process.env[key];
  }

  if (!existsSync(envFilePath)) {
    return undefined;
  }

  const entry = readFileSync(envFilePath, "utf8")
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith(`${key}=`));

  if (!entry) {
    return undefined;
  }

  return entry
    .slice(entry.indexOf("=") + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
}

const pagespeedApiKey = getEnvValue("PAGESPEED_API_KEY");

const formatScore = (score) => {
  if (typeof score !== "number") {
    return "n/a";
  }

  return `${Math.round(score * 100)}`;
};

const getDisplayValue = (audits, key) => audits[key]?.displayValue ?? "n/a";

async function runStrategy(strategy) {
  const response = await client.pagespeedapi.runpagespeed({
    url,
    strategy,
    category: ["performance"],
    key: pagespeedApiKey,
  });

  const lighthouse = response.data.lighthouseResult;
  const performance = lighthouse?.categories?.performance;
  const audits = lighthouse?.audits ?? {};
  const opportunities = Object.values(audits)
    .filter((audit) => audit?.details?.type === "opportunity" && typeof audit.numericValue === "number")
    .sort((a, b) => (b.numericValue ?? 0) - (a.numericValue ?? 0))
    .slice(0, 5);

  console.log(`\n${strategy.toUpperCase()}`);
  console.log(`Performance: ${formatScore(performance?.score)}`);
  console.log(`FCP: ${getDisplayValue(audits, "first-contentful-paint")}`);
  console.log(`LCP: ${getDisplayValue(audits, "largest-contentful-paint")}`);
  console.log(`Speed Index: ${getDisplayValue(audits, "speed-index")}`);
  console.log(`TBT: ${getDisplayValue(audits, "total-blocking-time")}`);
  console.log(`CLS: ${getDisplayValue(audits, "cumulative-layout-shift")}`);

  if (opportunities.length > 0) {
    console.log("Top opportunities:");
    for (const audit of opportunities) {
      console.log(`- ${audit.title}: ${audit.displayValue ?? "no estimate"}`);
    }
  }
}

for (const strategy of selectedStrategies) {
  await runStrategy(strategy);
}
