import { pagespeedonline } from "@googleapis/pagespeedonline";

const url = process.argv[2];
const strategies = process.argv.slice(3).filter((value) => value === "mobile" || value === "desktop");
const selectedStrategies = strategies.length > 0 ? strategies : ["mobile", "desktop"];

if (!url) {
  console.error("Usage: npm run pagespeed -- <url> [mobile] [desktop]");
  process.exit(1);
}

const client = pagespeedonline("v5");

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
    key: process.env.PAGESPEED_API_KEY,
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
