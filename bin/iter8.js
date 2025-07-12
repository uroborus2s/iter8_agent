#!/usr/bin/env node

/**
 * iter8 极简启动器
 * 直接执行MCP服务器，最简单的实现
 */

import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function createBasicConfig() {
  const cwd = process.cwd();
  const iter8Dir = join(cwd, ".iter8");
  
  if (await fileExists(iter8Dir)) {
    console.log("✅ .iter8目录已存在");
    return;
  }

  try {
    await fs.mkdir(iter8Dir, { recursive: true });
    
    const basicConfig = `# iter8项目配置
project:
  name: "${cwd.split('/').pop() || 'my-project'}"
  version: "0.0.1"
  created_date: "${new Date().toISOString().split('T')[0]}"
`;
    
    await fs.writeFile(join(iter8Dir, "config.yml"), basicConfig);
    console.log("✅ 已创建基本配置: .iter8/config.yml");
  } catch (error) {
    console.warn("⚠️ 创建配置失败:", error.message);
  }
}

async function startMCPServer() {
  const cwd = process.cwd();
  const serverPath = join(packageRoot, "index.js");
  
  // 检查MCP服务器是否存在
  if (!await fileExists(serverPath)) {
    console.error("❌ MCP服务器不存在:", serverPath);
    console.error("请检查iter8安装: npm install -g iter8");
    process.exit(1);
  }

  // 设置环境变量 - 智能路径解析
  const env = {
    ...process.env,
    ITER8_PROJECT_ROOT: cwd,
    ITER8_CONFIG_PATH: join(cwd, ".iter8/config.yml"),
    // 优先使用用户项目，回退到全局包
    ITER8_ROLES_PATH: await fileExists(join(cwd, ".iter8/agents")) 
      ? join(cwd, ".iter8/agents") 
      : join(packageRoot, ".iter8/agents"),
    ITER8_WORKFLOWS_PATH: await fileExists(join(cwd, ".iter8/workflows"))
      ? join(cwd, ".iter8/workflows")
      : join(packageRoot, ".iter8/workflows"),
    ITER8_TEMPLATES_PATH: await fileExists(join(cwd, ".iter8/templates"))
      ? join(cwd, ".iter8/templates")
      : join(packageRoot, ".iter8/templates"),
    ITER8_DOCS_PATH: join(cwd, "docs"),
    ITER8_ROLE_DEFINITIONS_PATH: await fileExists(join(cwd, ".iter8/teams"))
      ? join(cwd, ".iter8/teams/role-definitions")
      : join(packageRoot, ".iter8/teams/role-definitions"),
    NODE_ENV: "production"
  };

  // 直接执行node index.js
  const server = spawn("node", [serverPath], {
    stdio: "inherit",
    env,
    cwd
  });

  server.on("error", (error) => {
    console.error("❌ 启动失败:", error.message);
    process.exit(1);
  });

  // 处理进程信号
  process.on("SIGINT", () => server.kill("SIGINT"));
  process.on("SIGTERM", () => server.kill("SIGTERM"));
}

// 解析命令行参数
const command = process.argv[2];

switch (command) {
  case "init":
    console.log("🚀 初始化iter8项目...");
    createBasicConfig()
      .then(() => console.log("✅ 初始化完成！"))
      .catch(console.error);
    break;
    
  case "status":
    console.log("📊 iter8状态检查:");
    Promise.all([
      fileExists(join(packageRoot, "index.js")),
      fileExists(join(packageRoot, ".iter8/agents")),
      fileExists(join(process.cwd(), ".iter8/config.yml"))
    ]).then(([server, agents, config]) => {
      console.log(`${server ? "✅" : "❌"} MCP服务器: ${server ? "可用" : "不存在"}`);
      console.log(`${agents ? "✅" : "❌"} 角色定义: ${agents ? "可用" : "不存在"}`);
      console.log(`${config ? "✅" : "⚠️"} 项目配置: ${config ? "已配置" : "未配置"}`);
      
      if (server && agents) {
        console.log("🎉 iter8已就绪！");
      } else {
        console.log("❌ 请重新安装: npm install -g iter8");
      }
    });
    break;
    
  case "config":
    const tool = process.argv[4] || "augment-code"; // --tool augment-code
    console.log(`📝 生成${tool}配置文件...`);
    
    const configs = {
      "augment-code": {
        mcpServers: {
          "iter8-agile-team": {
            command: "iter8-mcp",
            args: [],
            cwd: ".",
            timeout: 30000,
            description: "iter8敏捷团队AI代理系统"
          }
        }
      }
    };
    
    const config = configs[tool] || configs["augment-code"];
    const filename = `${tool}-config.json`;
    
    fs.writeFile(filename, JSON.stringify(config, null, 2))
      .then(() => console.log(`✅ 已生成: ${filename}`))
      .catch(console.error);
    break;
    
  case "start":
    console.log("🚀 启动MCP服务器...");
    startMCPServer();
    break;
    
  case "--help":
  case "-h":
    console.log(`
iter8 - 敏捷团队AI代理系统

用法:
  iter8 init              初始化项目
  iter8 start             启动MCP服务器  
  iter8 status            检查状态
  iter8 config            生成AI工具配置
  iter8 --help            显示帮助

直接调用 (MCP协议):
  iter8                   直接启动MCP服务器
`);
    break;
    
  default:
    // 默认行为：直接启动MCP服务器（用于MCP协议调用）
    startMCPServer();
}
