import chalk from "chalk";
import type { Command } from "commander";
import { detectMcpHealth } from "@composio/ao-core";

export function registerMcp(program: Command): void {
  const mcp = program.command("mcp").description("Inspect MCP and provider capability state");

  mcp
    .command("health")
    .description("Show MCP/provider health and risk flags")
    .option("--json", "Output JSON")
    .action((opts: { json?: boolean }) => {
      const health = detectMcpHealth(process.env);

      if (opts.json) {
        console.log(JSON.stringify(health, null, 2));
        return;
      }

      console.log(chalk.bold("MCP/provider health"));
      console.log();
      for (const connector of health) {
        const state =
          connector.state === "connected"
            ? chalk.green(connector.state)
            : chalk.yellow(connector.state);
        console.log(`${chalk.cyan(connector.name.padEnd(18))} ${state}`);
        console.log(`  risk: ${connector.risk.join(", ")}`);
        if (connector.loginHint) {
          console.log(`  fix:  ${chalk.dim(connector.loginHint)}`);
        }
      }
    });
}
