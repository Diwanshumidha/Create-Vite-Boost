#!/usr/bin/env node
import {
  GenerateViteApp,
  InstallAndGenerateTailwind,
  TOptions,
  color,
  getUserPrompts,
} from "./helper.js";
import { program } from "commander";

import { intro, outro } from "@clack/prompts";

async function createReactApp(appName: string, options: TOptions) {
  // Main Entry Point To The Command
  const config = await getUserPrompts({ appName, ...options });
  intro(color.heading("Create Vite App"));
  await GenerateViteApp(config);
  process.chdir(config.appName || "");
  await InstallAndGenerateTailwind(config);
  outro(color.success("Your project has been created!"));
}

program
  .name("Create React App")
  .arguments("[app_name]") // Use 'arguments' instead of 'option' for <app_name>
  .description("Create a new React app")
  .option("-t, --tailwind", "Initialize Tailwind CSS")
  .option("-p, --path", "Enter a path where react app will be initialized")
  .option(
    "-m, --package-manager <npm|yarn|pnpm>",
    "Specify package manager (npm, yarn, pnpm)"
  )
  .action(createReactApp);

program.parse(process.argv);
