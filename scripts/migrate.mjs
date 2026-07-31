import { spawnSync } from "node:child_process";

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const migration = "20260731190000_add_comments";

// Uma tentativa antiga pelo pooler pode ter ficado marcada como falha.
// O PostgreSQL reverte o SQL da migração com erro; liberar o registro permite
// que a mesma migração seja executada pela conexão direta configurada no Prisma.
spawnSync(
  executable,
  ["prisma", "migrate", "resolve", "--rolled-back", migration],
  { stdio: "inherit" },
);

const deploy = spawnSync(executable, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
});

process.exit(deploy.status ?? 1);
