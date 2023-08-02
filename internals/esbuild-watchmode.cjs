const esbuild = require("esbuild");
const config = require("./esbuild-config.cjs");

async function runWatchMode() {
  let ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("Watching...");
}

runWatchMode();
