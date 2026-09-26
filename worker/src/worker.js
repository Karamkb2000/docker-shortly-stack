const { createClient } = require("redis");

const redis = createClient({ url: process.env.REDIS_URL || "redis://cache:6379" });
redis.on("error", (err) => console.error("redis error:", err.message));

async function main() {
  await redis.connect();
  console.log("aggregator worker started");

  const intervalMs = Number(process.env.TICK_MS || 5000);
  setInterval(async () => {
    const keys = await redis.keys("clicks:*");
    let total = 0;
    for (const key of keys) {
      total += Number(await redis.get(key)) || 0;
    }
    await redis.set("total_clicks", total);
    console.log(`aggregated ${keys.length} codes, total clicks = ${total}`);
  }, intervalMs);
}

main().catch((err) => {
  console.error("worker failed:", err);
  process.exit(1);
});
