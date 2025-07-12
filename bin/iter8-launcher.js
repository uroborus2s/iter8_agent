#!/usr/bin/env node

/**
 * iter8 本地MCP服务器启动器
 * 简化版本，只支持本地bin命令访问模式
 */

import chalk from "chalk";
import { spawn } from "child_process";
import { program } from "commander";
import { access, mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");

class Iter8Launcher {
  constructor() {
    this.cwd = process.cwd();
    this.packageRoot = packageRoot;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}]`;

    switch (type) {
      case "error":
        console.error(chalk.red(`${prefix} ERROR: ${message}`));
        break;
      case "success":
        console.log(chalk.green(`${prefix} SUCCESS: ${message}`));
        break;
      case "warning":
        console.log(chalk.yellow(`${prefix} WARNING: ${message}`));
        break;
      default:
        console.log(chalk.blue(`${prefix} INFO: ${message}`));
    }
  }

  async fileExists(path) {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  async resolveIter8Paths() {
    const userPaths = {
      config: join(this.cwd, ".iter8/config.yml"),
      agents: join(this.cwd, ".iter8/agents"),
      workflows: join(this.cwd, ".iter8/workflows"),
      templates: join(this.cwd, ".iter8/templates"),
      docs: join(this.cwd, "docs"),
      roleDefinitions: join(this.cwd, ".iter8/teams/role-definitions"),
    };

    const globalPaths = {
      config: join(this.packageRoot, ".iter8/config.yml"),
      agents: join(this.packageRoot, ".iter8/agents"),
      workflows: join(this.packageRoot, ".iter8/workflows"),
      templates: join(this.packageRoot, ".iter8/templates"),
      docs: join(this.packageRoot, "docs"),
      roleDefinitions: join(this.packageRoot, ".iter8/teams/role-definitions"),
    };

    const resolvedPaths = {};

    // 对每个路径进行智能解析：优先用户项目，回退到全局包
    for (const [key, userPath] of Object.entries(userPaths)) {
      const userExists = await this.fileExists(userPath);
      const globalPath = globalPaths[key];
      const globalExists = await this.fileExists(globalPath);

      if (userExists) {
        resolvedPaths[key] = userPath;
        this.log(`使用用户项目${key}: ${userPath}`, "info");
      } else if (globalExists) {
        resolvedPaths[key] = globalPath;
        this.log(`回退到全局包${key}: ${globalPath}`, "warning");
      } else {
        // 默认使用用户路径，即使不存在（可能会在运行时创建）
        resolvedPaths[key] = userPath;
        this.log(`默认使用${key}: ${userPath} (可能不存在)`, "warning");
      }
    }

    return resolvedPaths;
  }

  async initProject() {
    this.log("初始化iter8项目配置...", "info");

    const iter8Dir = join(this.cwd, ".iter8");
    const configExists = await this.fileExists(iter8Dir);

    if (configExists) {
      this.log(".iter8目录已存在，跳过初始化", "warning");
      return;
    }

    try {
      // 创建.iter8目录结构
      await mkdir(join(iter8Dir, "agents"), { recursive: true });
      await mkdir(join(iter8Dir, "workflows"), { recursive: true });
      await mkdir(join(iter8Dir, "templates"), { recursive: true });
      await mkdir(join(iter8Dir, "teams"), { recursive: true });
      await mkdir(join(iter8Dir, "integrations"), { recursive: true });

      // 创建基本配置
      const basicConfig = `# iter8项目配置文件
# 由iter8 init生成

project:
  name: "my-iter8-project"
  version: "0.0.1"
  description: "基于iter8的敏捷开发项目"
  created_date: "${new Date().toISOString().split("T")[0]}"

integrations:
  mcp_server:
    enabled: true
    server_path: "iter8-mcp"
    version: "0.0.1"
`;

      await writeFile(join(iter8Dir, "config.yml"), basicConfig);

      // 创建MCP配置文件
      const mcpConfig = {
        mcpServers: {
          "iter8-agile-team": {
            command: "iter8-mcp",
            args: [],
            cwd: ".",
            env: {
              ITER8_PROJECT_ROOT: ".",
              ITER8_CONFIG_PATH: ".iter8/config.yml",
              NODE_ENV: "production",
            },
            timeout: 30000,
            retries: 3,
            description: "iter8敏捷团队AI代理系统",
          },
        },
        mcp: {
          version: "1.0",
          enabled: true,
          logLevel: "info",
        },
      };

      await writeFile(
        join(this.cwd, "mcp-config.json"),
        JSON.stringify(mcpConfig, null, 2)
      );

      this.log("项目初始化完成！", "success");
      this.log("配置文件已创建:", "info");
      this.log("  - .iter8/config.yml", "info");
      this.log("  - mcp-config.json", "info");
      this.log("", "info");
      this.log("下一步:", "info");
      this.log("1. 配置您的AI工具使用 mcp-config.json", "info");
      this.log("2. 运行: iter8 start", "info");
    } catch (error) {
      this.log(`初始化失败: ${error.message}`, "error");
      process.exit(1);
    }
  }

  async startMCPServer(mode = "production") {
    this.log(`启动MCP服务器 (${mode}模式)...`, "info");

    const serverPath = join(this.packageRoot, "index.js");
    const serverExists = await this.fileExists(serverPath);

    if (!serverExists) {
      this.log("MCP服务器文件不存在，请检查安装", "error");
      this.log("尝试运行: npm install -g iter8", "info");
      process.exit(1);
    }

    // 智能路径解析：优先使用用户项目，回退到全局包
    const paths = await this.resolveIter8Paths();

    // 设置环境变量
    const env = {
      ...process.env,
      ITER8_PROJECT_ROOT: this.cwd,
      ITER8_CONFIG_PATH: paths.config,
      ITER8_ROLES_PATH: paths.agents,
      ITER8_WORKFLOWS_PATH: paths.workflows,
      ITER8_TEMPLATES_PATH: paths.templates,
      ITER8_DOCS_PATH: paths.docs,
      ITER8_ROLE_DEFINITIONS_PATH: paths.roleDefinitions,
      NODE_ENV: mode === "development" ? "development" : "production",
    };

    if (mode === "development") {
      env.DEBUG = "iter8:*";
    }

    // 启动MCP服务器
    const server = spawn("node", [serverPath], {
      stdio: "inherit",
      env,
      cwd: this.cwd,
    });

    server.on("error", (error) => {
      this.log(`服务器启动失败: ${error.message}`, "error");
      process.exit(1);
    });

    server.on("exit", (code) => {
      if (code !== 0) {
        this.log(`服务器异常退出，代码: ${code}`, "error");
        process.exit(code);
      }
    });

    // 处理进程信号
    process.on("SIGINT", () => {
      this.log("正在关闭MCP服务器...", "info");
      server.kill("SIGINT");
    });

    process.on("SIGTERM", () => {
      this.log("正在关闭MCP服务器...", "info");
      server.kill("SIGTERM");
    });
  }

  async showStatus() {
    this.log("iter8项目状态检查", "info");

    const checks = [
      {
        name: ".iter8目录",
        path: join(this.cwd, ".iter8"),
        required: true,
      },
      {
        name: "配置文件",
        path: join(this.cwd, ".iter8/config.yml"),
        required: true,
      },
      {
        name: "MCP配置",
        path: join(this.cwd, "mcp-config.json"),
        required: false,
      },
      {
        name: "MCP服务器",
        path: join(this.packageRoot, "index.js"),
        required: true,
      },
    ];

    let allGood = true;

    for (const check of checks) {
      const exists = await this.fileExists(check.path);
      const status = exists ? "✅" : check.required ? "❌" : "⚠️";
      const message = exists ? "存在" : "不存在";

      console.log(`${status} ${check.name}: ${message}`);

      if (!exists && check.required) {
        allGood = false;
      }
    }

    if (!allGood) {
      this.log("", "info");
      this.log("建议运行: iter8 init", "warning");
    } else {
      this.log("", "info");
      this.log("项目配置正常！", "success");
    }
  }

  async generateConfig(tool = "augment-code") {
    this.log(`生成${tool}配置文件...`, "info");

    const configs = {
      "augment-code": {
        filename: "augment-code-config.json",
        content: {
          mcpServers: {
            "iter8-agile-team": {
              command: "iter8-mcp",
              args: [],
              cwd: ".",
              env: {
                ITER8_PROJECT_ROOT: ".",
                NODE_ENV: "production",
              },
              timeout: 30000,
              retries: 3,
              description: "iter8敏捷团队AI代理系统",
            },
          },
        },
      },
      cursor: {
        filename: "cursor-mcp-config.json",
        content: {
          servers: {
            "iter8-agile-team": {
              command: "iter8-mcp",
              args: [],
              cwd: ".",
            },
          },
        },
      },
      vscode: {
        filename: "vscode-mcp-config.json",
        content: {
          "mcp.servers": {
            "iter8-agile-team": {
              command: "iter8-mcp",
              args: [],
              cwd: ".",
            },
          },
        },
      },
    };

    const config = configs[tool];
    if (!config) {
      this.log(`不支持的工具: ${tool}`, "error");
      this.log(`支持的工具: ${Object.keys(configs).join(", ")}`, "info");
      return;
    }

    const configPath = join(this.cwd, config.filename);
    await writeFile(configPath, JSON.stringify(config.content, null, 2));

    this.log(`配置文件已生成: ${config.filename}`, "success");
  }
}

// CLI程序定义
program
  .name("iter8")
  .description("iter8敏捷团队AI代理MCP服务器")
  .version("0.0.1");

program
  .command("init")
  .description("初始化iter8项目配置")
  .action(async () => {
    const launcher = new Iter8Launcher();
    await launcher.initProject();
  });

program
  .command("start")
  .description("启动MCP服务器")
  .option("-d, --dev", "开发模式")
  .action(async (options) => {
    const launcher = new Iter8Launcher();
    const mode = options.dev ? "development" : "production";
    await launcher.startMCPServer(mode);
  });

program
  .command("status")
  .description("检查项目状态")
  .action(async () => {
    const launcher = new Iter8Launcher();
    await launcher.showStatus();
  });

program
  .command("config")
  .description("生成AI工具配置文件")
  .option(
    "-t, --tool <tool>",
    "目标工具 (augment-code, cursor, vscode)",
    "augment-code"
  )
  .action(async (options) => {
    const launcher = new Iter8Launcher();
    await launcher.generateConfig(options.tool);
  });

// 默认行为：直接启动MCP服务器（用于MCP协议调用）
if (process.argv.length === 2) {
  const launcher = new Iter8Launcher();
  launcher.startMCPServer("production");
} else {
  program.parse();
}
