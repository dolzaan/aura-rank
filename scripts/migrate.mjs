import { spawnSync } from "node:child_process";

const executable = process.platform === "win32" ? "npx.cmd" : "npx";

const deploy = spawnSync(executable, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
});

if (deploy.status !== 0) process.exit(deploy.status ?? 1);

const generate = spawnSync(executable, ["prisma", "generate"], {
  stdio: "inherit",
});

process.exit(generate.status ?? 1);
