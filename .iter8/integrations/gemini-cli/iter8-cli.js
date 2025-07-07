#!/usr/bin/env node

/**
 * iter8 Gemini CLI 集成工具
 * 为Gemini CLI提供iter8敏捷团队AI代理支持
 * 版本: 2.0
 * 创建日期: 2025-01-08
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

// === iter8 CLI 主程序 ===
class Iter8CLI {
  constructor() {
    this.program = new Command();
    this.configPath = process.env.ITER8_CONFIG_PATH || './.iter8';
    this.templatesPath = process.env.ITER8_TEMPLATES_PATH || './templates';
    this.workflowsPath = process.env.ITER8_WORKFLOWS_PATH || './workflows';
    
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('iter8')
      .description('iter8敏捷团队AI代理CLI工具')
      .version('2.0.0');

    // 角色激活命令
    this.program
      .command('role')
      .description('管理iter8敏捷团队角色')
      .addCommand(this.createRoleActivateCommand())
      .addCommand(this.createRoleListCommand())
      .addCommand(this.createRoleInfoCommand());

    // 工作流管理命令
    this.program
      .command('workflow')
      .description('管理iter8敏捷工作流')
      .addCommand(this.createWorkflowRunCommand())
      .addCommand(this.createWorkflowListCommand())
      .addCommand(this.createWorkflowStatusCommand());

    // 模板生成命令
    this.program
      .command('template')
      .description('管理iter8模板系统')
      .addCommand(this.createTemplateGenerateCommand())
      .addCommand(this.createTemplateListCommand())
      .addCommand(this.createTemplateValidateCommand());

    // 项目管理命令
    this.program
      .command('project')
      .description('管理iter8项目配置')
      .addCommand(this.createProjectInitCommand())
      .addCommand(this.createProjectStatusCommand())
      .addCommand(this.createProjectConfigCommand());

    // 质量保证命令
    this.program
      .command('quality')
      .description('iter8质量保证工具')
      .addCommand(this.createQualityCheckCommand())
      .addCommand(this.createQualityReportCommand())
      .addCommand(this.createQualityMetricsCommand());

    // 团队协作命令
    this.program
      .command('team')
      .description('iter8团队协作工具')
      .addCommand(this.createTeamSyncCommand())
      .addCommand(this.createTeamHealthCommand())
      .addCommand(this.createTeamMetricsCommand());
  }

  // === 角色管理命令 ===
  createRoleActivateCommand() {
    return new Command('activate')
      .description('激活iter8敏捷团队角色')
      .argument('<role>', '角色ID或触发词 (如: po, @姜尚, ux-expert, @嫦娥)')
      .option('-c, --context <context>', '上下文信息')
      .option('-i, --interactive', '交互式模式')
      .action(async (role, options) => {
        await this.activateRole(role, options);
      });
  }

  createRoleListCommand() {
    return new Command('list')
      .description('列出所有可用角色')
      .option('-l, --layer <layer>', '按层级过滤 (business_value, technical_design, implementation, process_coordination)')
      .action(async (options) => {
        await this.listRoles(options);
      });
  }

  createRoleInfoCommand() {
    return new Command('info')
      .description('显示角色详细信息')
      .argument('<role>', '角色ID')
      .action(async (role) => {
        await this.showRoleInfo(role);
      });
  }

  // === 工作流管理命令 ===
  createWorkflowRunCommand() {
    return new Command('run')
      .description('运行iter8敏捷工作流')
      .argument('<workflow>', '工作流ID')
      .option('-i, --inputs <inputs>', '工作流输入参数 (JSON格式)')
      .option('--interactive', '交互式参数收集')
      .action(async (workflow, options) => {
        await this.runWorkflow(workflow, options);
      });
  }

  createWorkflowListCommand() {
    return new Command('list')
      .description('列出所有可用工作流')
      .option('-c, --category <category>', '按类别过滤')
      .action(async (options) => {
        await this.listWorkflows(options);
      });
  }

  createWorkflowStatusCommand() {
    return new Command('status')
      .description('查看工作流执行状态')
      .argument('<execution-id>', '执行ID')
      .action(async (executionId) => {
        await this.showWorkflowStatus(executionId);
      });
  }

  // === 模板管理命令 ===
  createTemplateGenerateCommand() {
    return new Command('generate')
      .description('生成iter8模板文档')
      .argument('<template>', '模板类型')
      .option('-o, --output <path>', '输出路径')
      .option('-v, --variables <variables>', '模板变量 (JSON格式)')
      .option('--interactive', '交互式变量收集')
      .action(async (template, options) => {
        await this.generateTemplate(template, options);
      });
  }

  createTemplateListCommand() {
    return new Command('list')
      .description('列出所有可用模板')
      .option('-t, --type <type>', '按类型过滤')
      .action(async (options) => {
        await this.listTemplates(options);
      });
  }

  createTemplateValidateCommand() {
    return new Command('validate')
      .description('验证模板文档')
      .argument('<file>', '文档文件路径')
      .action(async (file) => {
        await this.validateTemplate(file);
      });
  }

  // === 项目管理命令 ===
  createProjectInitCommand() {
    return new Command('init')
      .description('初始化iter8项目配置')
      .option('--force', '强制重新初始化')
      .action(async (options) => {
        await this.initProject(options);
      });
  }

  createProjectStatusCommand() {
    return new Command('status')
      .description('显示项目状态')
      .option('--detailed', '显示详细信息')
      .action(async (options) => {
        await this.showProjectStatus(options);
      });
  }

  createProjectConfigCommand() {
    return new Command('config')
      .description('管理项目配置')
      .option('-s, --set <key=value>', '设置配置项')
      .option('-g, --get <key>', '获取配置项')
      .option('-l, --list', '列出所有配置')
      .action(async (options) => {
        await this.manageProjectConfig(options);
      });
  }

  // === 质量保证命令 ===
  createQualityCheckCommand() {
    return new Command('check')
      .description('执行质量检查')
      .option('--scope <scope>', '检查范围 (code, docs, config, all)')
      .option('--fix', '自动修复问题')
      .action(async (options) => {
        await this.runQualityCheck(options);
      });
  }

  createQualityReportCommand() {
    return new Command('report')
      .description('生成质量报告')
      .option('-o, --output <path>', '报告输出路径')
      .option('-f, --format <format>', '报告格式 (json, html, markdown)')
      .action(async (options) => {
        await this.generateQualityReport(options);
      });
  }

  createQualityMetricsCommand() {
    return new Command('metrics')
      .description('显示质量指标')
      .option('--period <period>', '时间周期 (day, week, month)')
      .action(async (options) => {
        await this.showQualityMetrics(options);
      });
  }

  // === 团队协作命令 ===
  createTeamSyncCommand() {
    return new Command('sync')
      .description('同步团队状态')
      .option('--tools <tools>', '同步的工具 (jira, github, slack)')
      .action(async (options) => {
        await this.syncTeamStatus(options);
      });
  }

  createTeamHealthCommand() {
    return new Command('health')
      .description('检查团队健康状况')
      .option('--metrics', '显示健康指标')
      .action(async (options) => {
        await this.checkTeamHealth(options);
      });
  }

  createTeamMetricsCommand() {
    return new Command('metrics')
      .description('显示团队指标')
      .option('--sprint <number>', '指定Sprint')
      .option('--export <format>', '导出格式 (csv, json)')
      .action(async (options) => {
        await this.showTeamMetrics(options);
      });
  }

  // === 命令实现 ===
  async activateRole(role, options) {
    console.log(chalk.blue('🎭 激活iter8敏捷团队角色'));
    
    // 解析角色ID
    const roleId = this.parseRoleId(role);
    if (!roleId) {
      console.error(chalk.red(`❌ 未识别的角色: ${role}`));
      return;
    }

    // 加载角色信息
    const roleInfo = await this.loadRoleInfo(roleId);
    if (!roleInfo) {
      console.error(chalk.red(`❌ 角色不存在: ${roleId}`));
      return;
    }

    console.log(chalk.green(`✅ ${roleInfo.name} (${roleInfo.title}) 已激活`));
    console.log(chalk.cyan(`   ${roleInfo.mythological_title} → ${roleInfo.professional_title}`));
    
    if (options.interactive) {
      await this.interactiveRoleSession(roleInfo, options.context);
    }
  }

  async listRoles(options) {
    console.log(chalk.blue('🎭 iter8敏捷团队角色列表'));
    
    const roles = await this.loadAllRoles();
    const filteredRoles = options.layer 
      ? roles.filter(role => role.layer === options.layer)
      : roles;

    // 按层级分组显示
    const layers = {
      business_value: '🎯 业务价值层',
      technical_design: '🏗️ 技术设计层',
      implementation: '⚡ 实现层',
      process_coordination: '🔄 流程协调层'
    };

    for (const [layerId, layerName] of Object.entries(layers)) {
      const layerRoles = filteredRoles.filter(role => role.layer === layerId);
      if (layerRoles.length > 0) {
        console.log(chalk.yellow(`\n${layerName}`));
        layerRoles.forEach(role => {
          console.log(`  ${role.icon} ${chalk.green(role.name)} - ${role.title}`);
          console.log(`     触发: ${role.triggers.join(', ')}`);
        });
      }
    }
  }

  async runWorkflow(workflow, options) {
    console.log(chalk.blue(`🔄 启动工作流: ${workflow}`));
    
    let inputs = {};
    if (options.inputs) {
      try {
        inputs = JSON.parse(options.inputs);
      } catch (error) {
        console.error(chalk.red('❌ 输入参数格式错误'));
        return;
      }
    }

    if (options.interactive) {
      inputs = await this.collectWorkflowInputs(workflow);
    }

    // 模拟工作流执行
    const executionId = `${workflow}-${Date.now()}`;
    console.log(chalk.green(`✅ 工作流已启动，执行ID: ${executionId}`));
    console.log(chalk.cyan('   使用 iter8 workflow status <execution-id> 查看状态'));
  }

  async generateTemplate(template, options) {
    console.log(chalk.blue(`📝 生成模板: ${template}`));
    
    let variables = {};
    if (options.variables) {
      try {
        variables = JSON.parse(options.variables);
      } catch (error) {
        console.error(chalk.red('❌ 变量格式错误'));
        return;
      }
    }

    if (options.interactive) {
      variables = await this.collectTemplateVariables(template);
    }

    // 添加系统变量
    variables.creation_date = new Date().toISOString().split('T')[0];
    variables.current_time = new Date().toISOString();
    
    try {
      variables.git_branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      variables.git_user = execSync('git config user.name', { encoding: 'utf8' }).trim();
    } catch (error) {
      // Git信息获取失败时使用默认值
    }

    const outputPath = options.output || `${template}-${Date.now()}.md`;
    console.log(chalk.green(`✅ 模板已生成: ${outputPath}`));
  }

  // === 工具方法 ===
  parseRoleId(input) {
    const roleMap = {
      'po': 'po', '@姜尚': 'po',
      'ux-expert': 'ux-expert', '@嫦娥': 'ux-expert',
      'architect': 'architect', '@鲁班': 'architect',
      'analyst': 'analyst', '@文殊菩萨': 'analyst',
      'dev': 'dev', '@哪吒': 'dev',
      'qa': 'qa', '@杨戬': 'qa',
      'master': 'master', '@太乙真人': 'master',
      'orchestrator': 'orchestrator', '@元始天尊': 'orchestrator'
    };
    
    return roleMap[input] || null;
  }

  async loadRoleInfo(roleId) {
    // 这里应该从配置文件加载角色信息
    // 为了演示，返回模拟数据
    const roles = {
      po: {
        id: 'po',
        name: '姜尚',
        title: '产品负责人·封神榜主持者',
        layer: 'business_value',
        icon: '📋',
        mythological_title: '封神榜主持者',
        professional_title: '产品负责人·业务价值守护者',
        triggers: ['@姜尚', '*agent po', '@iter8/po']
      }
      // ... 其他角色
    };
    
    return roles[roleId] || null;
  }

  async loadAllRoles() {
    // 返回所有角色的模拟数据
    return [
      { id: 'po', name: '姜尚', title: '产品负责人·封神榜主持者', layer: 'business_value', icon: '📋', triggers: ['@姜尚'] },
      { id: 'ux-expert', name: '嫦娥', title: 'UX专家·月宫仙子', layer: 'business_value', icon: '🌙', triggers: ['@嫦娥'] },
      // ... 其他角色
    ];
  }

  async interactiveRoleSession(roleInfo, context) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'task',
        message: `请描述您希望${roleInfo.name}执行的任务:`,
      },
      {
        type: 'confirm',
        name: 'loadContext',
        message: '是否自动加载相关上下文?',
        default: true,
      }
    ]);

    console.log(chalk.green(`\n✅ ${roleInfo.name}正在执行任务: ${answers.task}`));
    if (answers.loadContext) {
      console.log(chalk.cyan('📂 正在加载相关上下文...'));
    }
  }

  async collectWorkflowInputs(workflow) {
    console.log(chalk.yellow(`\n📋 收集工作流输入参数: ${workflow}`));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'project_name',
        message: '项目名称:',
        default: 'iter8-project',
      },
      {
        type: 'input',
        name: 'description',
        message: '项目描述:',
      }
    ]);

    return answers;
  }

  async collectTemplateVariables(template) {
    console.log(chalk.yellow(`\n📝 收集模板变量: ${template}`));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'creator_name',
        message: '创建者姓名:',
        default: process.env.USER || 'iter8-user',
      },
      {
        type: 'input',
        name: 'project_name',
        message: '项目名称:',
      }
    ]);

    return answers;
  }

  // 启动CLI
  run() {
    this.program.parse();
  }
}

// 启动CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new Iter8CLI();
  cli.run();
}

export { Iter8CLI };
