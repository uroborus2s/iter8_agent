#!/usr/bin/env node

/**
 * iter8_agent CLI版本管理工具 (ESM模式)
 * 统一管理所有文件中的版本号、项目清理和验证功能
 */

import chalk from "chalk";
import { program } from "commander";
import {
  access,
  readdir,
  readFile,
  rm,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import inquirer from "inquirer";
import yaml from "js-yaml";
import { dirname, join } from "path";
import semver from "semver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

class VersionManager {
  constructor() {
    this.configPath = join(projectRoot, "version-config.json");
    this.config = null;
    this.updateLog = [];
    this.errors = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;

    if (type === "error") {
      console.log(chalk.red(logEntry));
      this.errors.push(logEntry);
    } else if (type === "success") {
      console.log(chalk.green(logEntry));
    } else if (type === "warning") {
      console.log(chalk.yellow(logEntry));
    } else {
      console.log(chalk.blue(logEntry));
    }

    this.updateLog.push(logEntry);
  }

  async loadConfig() {
    try {
      const content = await readFile(this.configPath, "utf8");
      this.config = JSON.parse(content);
      this.log(`加载版本配置: ${this.config.version}`, "success");
      return true;
    } catch (error) {
      this.log(`无法加载版本配置文件: ${error.message}`, "error");
      return false;
    }
  }

  async fileExists(filePath) {
    try {
      await access(join(projectRoot, filePath));
      return true;
    } catch {
      return false;
    }
  }

  async directoryExists(dirPath) {
    try {
      const stats = await stat(join(projectRoot, dirPath));
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // 计算新版本号
  calculateNewVersion(currentVersion, type, prerelease = null) {
    try {
      if (type === "prerelease") {
        if (!prerelease) {
          prerelease = "beta";
        }
        return semver.inc(currentVersion, "prerelease", prerelease);
      } else {
        return semver.inc(currentVersion, type);
      }
    } catch (error) {
      throw new Error(`无法计算新版本号: ${error.message}`);
    }
  }

  // 验证版本号格式
  isValidVersion(version) {
    return semver.valid(version) !== null;
  }

  // 更新package.json版本
  async updatePackageJson(newVersion) {
    try {
      const packagePath = join(projectRoot, "package.json");
      const content = await readFile(packagePath, "utf8");
      const packageJson = JSON.parse(content);

      const oldVersion = packageJson.version;
      packageJson.version = newVersion;

      // 同时更新mcp.version
      if (packageJson.mcp && packageJson.mcp.version) {
        packageJson.mcp.version = newVersion;
      }

      await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
      this.log(`更新 package.json: ${oldVersion} → ${newVersion}`, "success");
    } catch (error) {
      throw new Error(`更新package.json失败: ${error.message}`);
    }
  }

  // 更新.iter8/config.yml中的MCP服务器版本
  async updateMcpConfig(newVersion) {
    try {
      const configPath = join(projectRoot, ".iter8/config.yml");
      const content = await readFile(configPath, "utf8");
      const config = yaml.load(content);

      const oldVersion = config.integrations.augment_code.mcp_server.version;
      config.integrations.augment_code.mcp_server.version = newVersion;

      const updatedYaml = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      await writeFile(configPath, updatedYaml);
      this.log(
        `更新 .iter8/config.yml: ${oldVersion} → ${newVersion}`,
        "success"
      );
    } catch (error) {
      throw new Error(`更新MCP配置失败: ${error.message}`);
    }
  }

  // 更新src/index.ts中的版本声明
  async updateSourceVersion(newVersion) {
    try {
      const sourcePath = join(projectRoot, "src/index.ts");
      const content = await readFile(sourcePath, "utf8");

      const versionPattern = /version: ["']([^"']+)["']/;
      const match = content.match(versionPattern);

      if (match) {
        const oldVersion = match[1];
        const updatedContent = content.replace(
          versionPattern,
          `version: "${newVersion}"`
        );

        await writeFile(sourcePath, updatedContent);
        this.log(`更新 src/index.ts: ${oldVersion} → ${newVersion}`, "success");
      } else {
        this.log(`在 src/index.ts 中未找到版本声明`, "warning");
      }
    } catch (error) {
      throw new Error(`更新源码版本失败: ${error.message}`);
    }
  }

  // 更新角色定义文件中的版本注释
  async updateRoleDefinitions(newVersion) {
    try {
      const roleDefsPath = join(projectRoot, ".iter8/teams/role-definitions");
      const files = await readdir(roleDefsPath);
      const ymlFiles = files.filter((f) => f.endsWith(".yml"));

      for (const file of ymlFiles) {
        const filePath = join(roleDefsPath, file);
        const content = await readFile(filePath, "utf8");

        const versionPattern = /# 版本: .*/;
        const match = content.match(versionPattern);

        if (match) {
          const oldVersionLine = match[0];
          const updatedContent = content.replace(
            versionPattern,
            `# 版本: ${newVersion} | 更新日期: ${
              new Date().toISOString().split("T")[0]
            }`
          );

          await writeFile(filePath, updatedContent);
          this.log(
            `更新 ${file}: ${oldVersionLine} → # 版本: ${newVersion}`,
            "success"
          );
        }
      }
    } catch (error) {
      throw new Error(`更新角色定义版本失败: ${error.message}`);
    }
  }

  // 验证版本一致性
  async validateVersions(targetVersion) {
    this.log("开始验证版本一致性...", "info");
    this.log(`目标版本: ${targetVersion}`, "info");

    const results = [];

    try {
      // 1. 验证package.json
      const packageJson = JSON.parse(
        await readFile(join(projectRoot, "package.json"), "utf8")
      );
      results.push({
        file: "package.json",
        field: "version",
        expected: targetVersion,
        actual: packageJson.version,
        valid: packageJson.version === targetVersion,
      });

      results.push({
        file: "package.json",
        field: "mcp.version",
        expected: targetVersion,
        actual: packageJson.mcp?.version,
        valid: packageJson.mcp?.version === targetVersion,
      });

      // 2. 验证.iter8/config.yml
      const configExists = await this.fileExists(".iter8/config.yml");
      if (configExists) {
        const configContent = await readFile(
          join(projectRoot, ".iter8/config.yml"),
          "utf8"
        );
        const config = yaml.load(configContent);
        const mcpVersion =
          config?.integrations?.augment_code?.mcp_server?.version;
        results.push({
          file: ".iter8/config.yml",
          field: "integrations.augment_code.mcp_server.version",
          expected: targetVersion,
          actual: mcpVersion,
          valid: mcpVersion === targetVersion,
        });
      }

      // 3. 验证src/index.ts
      const sourceExists = await this.fileExists("src/index.ts");
      if (sourceExists) {
        const sourceContent = await readFile(
          join(projectRoot, "src/index.ts"),
          "utf8"
        );
        const versionMatch = sourceContent.match(/version: ["']([^"']+)["']/);
        const sourceVersion = versionMatch ? versionMatch[1] : null;
        results.push({
          file: "src/index.ts",
          field: "version",
          expected: targetVersion,
          actual: sourceVersion,
          valid: sourceVersion === targetVersion,
        });
      }

      // 4. 验证角色定义文件
      const roleDefsExists = await this.directoryExists(
        ".iter8/teams/role-definitions"
      );
      if (roleDefsExists) {
        const roleDefsPath = join(projectRoot, ".iter8/teams/role-definitions");
        const roleFiles = await readdir(roleDefsPath);
        const ymlFiles = roleFiles.filter((f) => f.endsWith(".yml"));

        for (const file of ymlFiles) {
          const filePath = join(roleDefsPath, file);
          const content = await readFile(filePath, "utf8");
          const versionMatch = content.match(/# 版本: ([^\s|]+)/);
          const roleVersion = versionMatch ? versionMatch[1] : null;

          results.push({
            file: `.iter8/teams/role-definitions/${file}`,
            field: "版本注释",
            expected: targetVersion,
            actual: roleVersion,
            valid: roleVersion === targetVersion,
          });
        }
      }
    } catch (error) {
      this.log(`验证过程中出错: ${error.message}`, "error");
      return false;
    }

    // 显示验证结果
    console.log(chalk.cyan("\n📊 版本验证结果:\n"));

    let allValid = true;
    const validCount = results.filter((r) => r.valid).length;
    const totalCount = results.length;

    for (const result of results) {
      const status = result.valid ? "✅" : "❌";
      const actualDisplay = result.actual || "未找到";
      console.log(
        `${status} ${result.file} (${result.field}): ${actualDisplay}`
      );
      if (!result.valid) {
        console.log(chalk.red(`   期望: ${result.expected}`));
        allValid = false;
      }
    }

    console.log(chalk.cyan(`\n📈 验证统计: ${validCount}/${totalCount} 通过`));

    if (allValid) {
      this.log("所有版本验证通过！项目已准备好发布。", "success");
    } else {
      this.log("部分版本验证失败，请检查上述结果并修复。", "warning");
    }

    return allValid;
  }

  // 同步版本到所有文件
  async syncVersion(newVersion) {
    this.log(`开始同步版本到所有文件: ${newVersion}`, "info");

    try {
      await this.updatePackageJson(newVersion);
      await this.updateMcpConfig(newVersion);
      await this.updateSourceVersion(newVersion);
      await this.updateRoleDefinitions(newVersion);

      // 更新版本配置文件
      this.config.version = newVersion;
      this.config.release_date = new Date().toISOString().split("T")[0];

      await writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2) + "\n"
      );
      this.log("更新版本配置文件", "success");

      this.log("版本同步完成！", "success");
      return true;
    } catch (error) {
      this.log(`版本同步失败: ${error.message}`, "error");
      return false;
    }
  }

  // 项目清理功能
  async cleanProject() {
    this.log("开始项目清理...", "info");

    const redundantFiles = [];
    const issues = [];

    // 识别冗余文件
    const filesToCheck = [
      "cleanup-project.js",
      "validate-versions.js",
      "version-manager.js",
      "test-build.js",
      "src copy",
    ];

    for (const file of filesToCheck) {
      const exists = await this.fileExists(file);
      if (exists) {
        const stats = await stat(join(projectRoot, file));
        redundantFiles.push({
          path: file,
          isDirectory: stats.isDirectory(),
          reason: "冗余的脚本文件，功能已整合到CLI工具中",
        });
      }
    }

    // 执行清理
    for (const file of redundantFiles) {
      try {
        const fullPath = join(projectRoot, file.path);
        if (file.isDirectory) {
          await rm(fullPath, { recursive: true, force: true });
          this.log(`删除目录: ${file.path} (${file.reason})`, "success");
        } else {
          await unlink(fullPath);
          this.log(`删除文件: ${file.path} (${file.reason})`, "success");
        }
      } catch (error) {
        this.log(`删除 ${file.path} 失败: ${error.message}`, "error");
      }
    }

    // 验证必要的目录结构
    const requiredDirs = [
      ".iter8/agents",
      ".iter8/teams/role-definitions",
      ".iter8/workflows",
      ".iter8/templates",
    ];

    for (const dir of requiredDirs) {
      const exists = await this.directoryExists(dir);
      if (!exists) {
        issues.push({
          type: "missing_directory",
          path: dir,
          message: "必需的目录不存在",
        });
      }
    }

    if (issues.length > 0) {
      this.log("发现项目结构问题:", "warning");
      for (const issue of issues) {
        this.log(`  - ${issue.path}: ${issue.message}`, "warning");
      }
    }

    this.log(
      `项目清理完成！清理了 ${redundantFiles.length} 个文件/目录`,
      "success"
    );
    return { cleanedFiles: redundantFiles, issues };
  }

  // 显示当前版本信息
  async showCurrentVersions() {
    console.log(chalk.cyan("📋 当前版本信息:\n"));

    try {
      // package.json
      const packageJson = JSON.parse(
        await readFile(join(projectRoot, "package.json"), "utf8")
      );
      console.log(`📦 package.json: ${chalk.green(packageJson.version)}`);
      console.log(
        `🔧 MCP配置: ${chalk.green(packageJson.mcp?.version || "未设置")}`
      );

      // .iter8/config.yml
      const configExists = await this.fileExists(".iter8/config.yml");
      if (configExists) {
        const configContent = await readFile(
          join(projectRoot, ".iter8/config.yml"),
          "utf8"
        );
        const config = yaml.load(configContent);
        const mcpVersion =
          config?.integrations?.augment_code?.mcp_server?.version;
        console.log(
          `⚙️  .iter8/config.yml: ${chalk.green(mcpVersion || "未设置")}`
        );
      }

      // src/index.ts
      const sourceExists = await this.fileExists("src/index.ts");
      if (sourceExists) {
        const sourceContent = await readFile(
          join(projectRoot, "src/index.ts"),
          "utf8"
        );
        const versionMatch = sourceContent.match(/version: ["']([^"']+)["']/);
        const sourceVersion = versionMatch ? versionMatch[1] : "未找到";
        console.log(`💻 src/index.ts: ${chalk.green(sourceVersion)}`);
      }

      // 版本配置
      if (this.config) {
        console.log(`🎯 版本配置: ${chalk.green(this.config.version)}`);
        console.log(`📅 发布日期: ${chalk.green(this.config.release_date)}`);
      }
    } catch (error) {
      this.log(`显示版本信息失败: ${error.message}`, "error");
    }
  }
}

// CLI命令定义
async function setupCLI() {
  const manager = new VersionManager();

  program
    .name("iter8-version")
    .description("iter8_agent CLI版本管理工具")
    .version("1.0.0");

  program
    .command("current")
    .description("显示当前版本信息")
    .action(async () => {
      await manager.loadConfig();
      await manager.showCurrentVersions();
    });

  program
    .command("validate")
    .description("验证版本一致性")
    .option("-v, --version <version>", "指定目标版本进行验证")
    .action(async (options) => {
      await manager.loadConfig();
      const targetVersion = options.version || manager.config?.version;
      if (!targetVersion) {
        console.log(chalk.red("❌ 未指定版本且无法从配置中获取"));
        process.exit(1);
      }
      const success = await manager.validateVersions(targetVersion);
      process.exit(success ? 0 : 1);
    });

  program
    .command("sync")
    .description("同步版本到所有文件")
    .option("-v, --version <version>", "指定要同步的版本")
    .action(async (options) => {
      await manager.loadConfig();

      let newVersion = options.version;
      if (!newVersion) {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "version",
            message: "请输入要同步的版本号:",
            default: manager.config?.version,
            validate: (input) => {
              return (
                manager.isValidVersion(input) || "请输入有效的语义化版本号"
              );
            },
          },
        ]);
        newVersion = answers.version;
      }

      const success = await manager.syncVersion(newVersion);
      process.exit(success ? 0 : 1);
    });

  program
    .command("bump")
    .description("递增版本号")
    .option(
      "-t, --type <type>",
      "版本递增类型 (major, minor, patch, prerelease)",
      "patch"
    )
    .option(
      "-p, --prerelease <identifier>",
      "预发布标识符 (alpha, beta, rc)",
      "beta"
    )
    .action(async (options) => {
      await manager.loadConfig();

      const currentVersion = manager.config?.version;
      if (!currentVersion) {
        console.log(chalk.red("❌ 无法获取当前版本"));
        process.exit(1);
      }

      try {
        const newVersion = manager.calculateNewVersion(
          currentVersion,
          options.type,
          options.prerelease
        );

        console.log(
          chalk.cyan(`📈 版本递增: ${currentVersion} → ${newVersion}`)
        );

        const answers = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: "确认执行版本递增吗？",
            default: true,
          },
        ]);

        if (answers.confirm) {
          const success = await manager.syncVersion(newVersion);
          process.exit(success ? 0 : 1);
        } else {
          console.log(chalk.yellow("操作已取消"));
        }
      } catch (error) {
        console.log(chalk.red(`❌ 版本递增失败: ${error.message}`));
        process.exit(1);
      }
    });

  program
    .command("clean")
    .description("清理项目冗余文件")
    .option("--dry-run", "预览清理操作而不实际执行")
    .action(async (options) => {
      const manager = new VersionManager();

      if (options.dryRun) {
        console.log(chalk.yellow("🔍 预览模式 - 不会实际删除文件"));
        // 这里可以添加预览逻辑
      }

      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "确认执行项目清理吗？这将删除冗余文件。",
          default: false,
        },
      ]);

      if (answers.confirm) {
        await manager.cleanProject();
      } else {
        console.log(chalk.yellow("清理操作已取消"));
      }
    });

  // 解析命令行参数
  program.parse();
}

// 主函数
async function main() {
  try {
    await setupCLI();
  } catch (error) {
    console.error(chalk.red(`❌ CLI工具运行失败: ${error.message}`));
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { VersionManager };
