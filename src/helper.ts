import chalk from "chalk";
import * as p from "@clack/prompts";
import { $ } from "execa";
import fs from "fs";
import path from "path";

import {
  GenerateViteCommand,
  generateExecutableCommand,
  generateInstallCommand,
} from "./Commands.js";
import { IndexCssContent, TailwindConfigContent } from "./constant.js";

export type TOptions = {
  appName?: string;
  path?: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  tailwind?: boolean;
  variant?: "react" | "react-ts" | "react-swc" | "react-swc-ts";
};

const $$ = $({ stdio: "ignore" });

// Helper functions for console messages with different styles
export const color = {
  success: (message: string) => chalk.green(`✔ ${message}`),
  error: (message: string) => chalk.red(`✘ ${message}`),
  warning: (message: string) => chalk.yellow(`⚠ ${message}`),
  heading: (message: string) => chalk.bgBlueBright.white(message),
};

export const ErrorToString = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.stack ?? error.message.toString();
  return "An unknown error occurred.";
};

async function writeToFile(path: string, content: string) {
  try {
    await fs.writeFileSync(path, content);
  } catch (error) {
    console.error(`Error while writing to ${path}:`, error);
    process.exit(1);
  }
}

export async function getUserPrompts(options: TOptions) {
  let config: TOptions = {
    appName: options.appName,
    path: options.path || process.cwd(),
    packageManager: options.packageManager,
    tailwind: options.tailwind,
  };
  // ---------- Getting AppName ------------
  if (!config.appName) {
    let appName = await p.text({
      message: "What is the Name of the app",
      placeholder: "my-app",
      validate(value) {
        if (value.length === 0) return `App Name is required!`;
      },
    });
    if (p.isCancel(appName)) {
      console.log(color.error("Generation cancelled by user."));
      process.exit(1);
    }
    config.appName = appName;
  }

  // ------------- Variant (TS | JS) -----------------

  const Variant = await p.select({
    message: "Which Variant You Want",
    options: [
      { label: "Typescript", value: "react-ts" },
      { label: "Typescript  + SWC", value: "react-swc-ts" },
      { label: "Javascript", value: "react" },
      { label: "Javascript + SWC", value: "react-swc" },
    ],
  });
  if (p.isCancel(Variant)) {
    console.log(color.error("Generation cancelled by user."));
    process.exit(1);
  }

  // For some reason the type of prompt is unknown to handle that i have added if statement

  if (
    typeof Variant !== "string" ||
    !["react", "react-ts", "react-swc", "react-swc-ts"].includes(Variant)
  ) {
    console.error("Invalid package manager selected!");
    process.exit(1);
  }

  // It is Verified in above if statement and package manager can only be these
  config.variant = (Variant as TOptions["variant"]) || "react";

  // ------------ You want Tailwind --------------

  if (!config.tailwind) {
    let tailwind = await p.confirm({
      message: "Do You want to use Tailwind",
    });
    if (p.isCancel(tailwind)) {
      console.log(color.error("Generation cancelled by user."));
      process.exit(1);
    }
    config.tailwind = tailwind;
  }

  // -------------- Package Manager You use ---------------

  if (!config.packageManager) {
    const packageManager = await p.select({
      message: "Choose a Package Manager",
      options: [
        { label: "npm", value: "npm" },
        { label: "Yarn", value: "yarn" },
        { label: "Pnpm", value: "pnpm" },
      ],
    });

    if (p.isCancel(packageManager)) {
      console.log(color.error("Generation cancelled by user."));
      process.exit(1);
    }

    // For some reason the type of prompt is unknown to handle that i have added if statement

    if (
      typeof packageManager !== "string" ||
      !["npm", "yarn", "pnpm"].includes(packageManager)
    ) {
      console.error("Invalid package manager selected!");
      process.exit(1);
    }

    // It is Verified in above if statement and package manager can only be these
    config.packageManager = packageManager as "npm" | "yarn" | "pnpm";
  }

  return config;
}

// Commands To Run

export async function GenerateViteApp(config: TOptions) {
  const s = p.spinner();
  try {
    s.start("Generating a Vite app");
    await $$`${GenerateViteCommand(config)}`;
    s.stop("Vite app created successfully!");
  } catch (e) {
    const error = ErrorToString(e);
    console.error("Error creating the Vite app:", error);
    s.stop("There was An Error");
  }
}

export async function InstallAndGenerateTailwind(config: TOptions) {
  if (!config.tailwind) return;
  const s = p.spinner();

  try {
    // Installing Tailwind Css
    s.start("Installing Tailwind CSS and Other Dependency");
    await $$`${generateInstallCommand(
      config.packageManager,
      "-D tailwindcss postcss autoprefixer"
    )}`;

    // Generating Config File
    s.message("Tailwind installed! Now generating configuration...");
    await $$`${generateExecutableCommand(
      config.packageManager,
      "tailwindcss init",
      ["-p"]
    )}`;

    await writeToFile("tailwind.config.js", TailwindConfigContent);
    await writeToFile("src/index.css", IndexCssContent);

    s.stop("Added Tailwind Css");
  } catch (e) {
    const error = ErrorToString(e);
    console.error("Error while adding Tailwind css :", error);
    s.stop("There was An Error");
    process.exit(1);
  }
}
