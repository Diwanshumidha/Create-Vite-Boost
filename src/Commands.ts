import { TOptions } from "./helper.js";

export function generateInstallCommand(
  packageManager: TOptions["packageManager"],
  command: string,
  options: string[] = []
): string {
  switch (packageManager) {
    case "npm":
      return `npm install ${command} ${options.join(" ")} `;
    case "yarn":
      return `yarn add ${command} ${options.join(" ")} `;
    case "pnpm":
      return `pnpm install  ${command} ${options.join(" ")}`;
    default:
      throw new Error("Invalid package manager specified");
  }
}

export function generateExecutableCommand(
  packageManager: TOptions["packageManager"],
  command: string,
  options: string[] = []
): string {
  switch (packageManager) {
    case "npm":
      return `npx ${command} ${options.join(" ")}`;
    case "yarn":
      return `yarn ${command} ${options.join(" ")}`;
    case "pnpm":
      return `pnpm dlx ${command} ${options.join(" ")}`;
    default:
      throw new Error("Invalid package manager specified");
  }
}

export function GenerateViteCommand(config: TOptions) {
  switch (config.packageManager) {
    case "npm":
      return `npm create vite@latest ${config.appName} -- --template ${config.variant}  `;
    case "yarn":
      return `yarn create vite@latest ${config.appName} --template ${config.variant}   `;
    case "pnpm":
      return `pnpm create vite@latest ${config.appName} --template ${config.variant} `;
    default:
      throw new Error("Invalid package manager specified");
  }
}
