#!/usr/bin/env node

/**
 * iter8 Augment Code MCP服务器
 * 为Augment Code提供iter8敏捷团队AI代理集成
 * 版本: 0.0.1
 * 创建日期: 2025-01-08
 * 更新日期: 2025-01-08
 *
 * 支持特性:
 * - MCP 1.0+ 协议兼容
 * - 动态工具注册
 * - 进度通知
 * - 图像上下文支持
 * - 流式HTTP支持
 * - OAuth认证集成
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as yaml from "js-yaml";
import * as path from "path";

// === iter8 角色系统配置 ===
interface Iter8Role {
  id: string;
  name: string;
  title: string;
  layer:
    | "business_value"
    | "technical_design"
    | "implementation"
    | "process_coordination";
  level: number;
  icon: string;
  mythological_title: string;
  professional_title: string;
  capabilities: string[];
  triggers: string[];
  auto_load_context: string[];
}

interface Iter8Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  participants: string[];
  steps: WorkflowStep[];
  triggers: string[];
  estimated_duration: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  action: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  dependencies: string[];
  optional: boolean;
}

// === iter8 核心角色定义 ===
const ITER8_ROLES: Record<string, Iter8Role> = {
  po: {
    id: "po",
    name: "姜尚",
    title: "产品负责人·封神榜主持者",
    layer: "business_value",
    level: 1,
    icon: "🎯",
    mythological_title: "封神榜主持者",
    professional_title: "产品负责人·业务价值守护者",
    capabilities: [
      "product_requirement_definition",
      "user_story_creation",
      "business_value_validation",
      "stakeholder_communication",
      "epic_planning",
      "product_roadmap",
    ],
    triggers: ["@姜尚", "*agent po", "@iter8/po"],
    auto_load_context: ["prd", "epics", "user-stories", "business-metrics"],
  },
  "ux-expert": {
    id: "ux-expert",
    name: "嫦娥",
    title: "UX专家·月宫仙子",
    layer: "business_value",
    level: 2,
    icon: "🌙",
    mythological_title: "月宫仙子",
    professional_title: "用户体验专家·用户价值创造者",
    capabilities: [
      "ux_design",
      "user_research",
      "prototype_creation",
      "usability_testing",
      "interaction_design",
      "design_system",
    ],
    triggers: ["@嫦娥", "*agent ux-expert", "@iter8/ux-expert"],
    auto_load_context: [
      "ux-spec",
      "user-research",
      "prototypes",
      "design-system",
    ],
  },
  architect: {
    id: "architect",
    name: "鲁班",
    title: "技术架构师·工匠之神",
    layer: "technical_design",
    level: 3,
    icon: "🔧",
    mythological_title: "工匠之神",
    professional_title: "技术架构师·系统设计大师",
    capabilities: [
      "system_architecture_design",
      "technology_selection",
      "api_design",
      "performance_planning",
      "scalability_design",
      "security_architecture",
    ],
    triggers: ["@鲁班", "*agent architect", "@iter8/architect"],
    auto_load_context: [
      "architecture",
      "api-spec",
      "tech-stack",
      "performance",
    ],
  },
  analyst: {
    id: "analyst",
    name: "文殊菩萨",
    title: "业务分析师·智慧之神",
    layer: "technical_design",
    level: 4,
    icon: "🧠",
    mythological_title: "智慧之神",
    professional_title: "业务分析师·需求洞察专家",
    capabilities: [
      "requirement_analysis",
      "business_modeling",
      "data_modeling",
      "process_optimization",
      "stakeholder_analysis",
    ],
    triggers: ["@文殊菩萨", "*agent analyst", "@iter8/analyst"],
    auto_load_context: [
      "requirements",
      "business-model",
      "data-model",
      "rules",
    ],
  },
  dev: {
    id: "dev",
    name: "哪吒",
    title: "全栈开发工程师·三头六臂神童",
    layer: "implementation",
    level: 5,
    icon: "⚡",
    mythological_title: "三头六臂神童",
    professional_title: "全栈开发工程师·代码实现专家",
    capabilities: [
      "code_implementation",
      "technical_problem_solving",
      "development_environment_setup",
      "technical_debt_management",
      "code_review",
    ],
    triggers: ["@哪吒", "*agent dev", "@iter8/dev"],
    auto_load_context: ["src", "tests", "config", "implementation"],
  },
  qa: {
    id: "qa",
    name: "杨戬",
    title: "QA工程师·二郎神",
    layer: "implementation",
    level: 6,
    icon: "👁️",
    mythological_title: "二郎神",
    professional_title: "质量保证工程师·慧眼识珠问题解决专家",
    capabilities: [
      "quality_assurance",
      "test_strategy_design",
      "defect_management",
      "automation_testing",
      "performance_testing",
    ],
    triggers: ["@杨戬", "*agent qa", "@iter8/qa"],
    auto_load_context: ["tests", "quality-reports", "test-plans", "defects"],
  },
  master: {
    id: "master",
    name: "太乙真人",
    title: "敏捷教练·修行导师",
    layer: "process_coordination",
    level: 7,
    icon: "🧙‍♂️",
    mythological_title: "修行导师",
    professional_title: "敏捷教练·流程指导专家",
    capabilities: [
      "agile_process_guidance",
      "team_coaching",
      "impediment_removal",
      "continuous_improvement",
      "ceremony_facilitation",
    ],
    triggers: ["@太乙真人", "*agent master", "@iter8/master"],
    auto_load_context: ["process", "ceremonies", "improvements", "team-health"],
  },
  orchestrator: {
    id: "orchestrator",
    name: "元始天尊",
    title: "团队协调者·三清之首",
    layer: "process_coordination",
    level: 8,
    icon: "👑",
    mythological_title: "三清之首",
    professional_title: "团队协调者·整体统筹专家",
    capabilities: [
      "team_coordination",
      "resource_management",
      "decision_support",
      "conflict_resolution",
      "strategic_alignment",
    ],
    triggers: ["@元始天尊", "*agent orchestrator", "@iter8/orchestrator"],
    auto_load_context: ["workflows", "team-status", "resources", "decisions"],
  },
};

// === 路径配置常量 ===
const DEFAULT_PATHS = {
  PROJECT_ROOT: process.env.ITER8_PROJECT_ROOT || ".",
  CONFIG_PATH: process.env.ITER8_CONFIG_PATH || ".iter8/config.yml",
  ROLES_PATH: process.env.ITER8_ROLES_PATH || ".iter8/agents",
  WORKFLOWS_PATH: process.env.ITER8_WORKFLOWS_PATH || ".iter8/workflows",
  TEMPLATES_PATH: process.env.ITER8_TEMPLATES_PATH || ".iter8/templates",
  DOCS_PATH: process.env.ITER8_DOCS_PATH || "docs",
  ROLE_DEFINITIONS_PATH:
    process.env.ITER8_ROLE_DEFINITIONS_PATH || ".iter8/teams/role-definitions",
};

// === 角色文件映射 ===
const ROLE_FILE_MAPPING: Record<string, string> = {
  po: ".iter8/agents/po.prompt.md",
  "ux-expert": ".iter8/agents/ux-expert.prompt.md",
  architect: ".iter8/agents/architect.prompt.md",
  analyst: ".iter8/agents/analyst.prompt.md",
  dev: ".iter8/agents/dev.prompt.md",
  qa: ".iter8/agents/qa.prompt.md",
  master: ".iter8/agents/master.prompt.md",
  orchestrator: ".iter8/agents/orchestrator.prompt.md",
};

// === MCP服务器类 ===
class Iter8MCPServer {
  private server: Server;
  private configPath: string;
  private templatesPath: string;
  private workflowsPath: string;
  private rolesPath: string;
  private roleDefinitionsPath: string;

  constructor() {
    this.server = new Server(
      {
        name: "iter8-agile-team",
        version: "0.0.1",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 从环境变量获取配置路径
    this.configPath = DEFAULT_PATHS.CONFIG_PATH;
    this.templatesPath = DEFAULT_PATHS.TEMPLATES_PATH;
    this.workflowsPath = DEFAULT_PATHS.WORKFLOWS_PATH;
    this.rolesPath = DEFAULT_PATHS.ROLES_PATH;
    this.roleDefinitionsPath = DEFAULT_PATHS.ROLE_DEFINITIONS_PATH;

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "activate_role",
            description: "激活iter8敏捷团队角色",
            inputSchema: {
              type: "object",
              properties: {
                trigger: {
                  type: "string",
                  description: "角色触发词 (如: @姜尚, @嫦娥, @鲁班等)",
                },
                context: {
                  type: "string",
                  description: "上下文信息",
                },
                user_request: {
                  type: "string",
                  description: "用户请求内容",
                },
              },
              required: ["trigger", "user_request"],
            },
          },
          {
            name: "start_workflow",
            description: "启动iter8敏捷工作流",
            inputSchema: {
              type: "object",
              properties: {
                workflow_id: {
                  type: "string",
                  description:
                    "工作流ID (如: product-documentation, epic-story-breakdown等)",
                },
                inputs: {
                  type: "object",
                  description: "工作流输入参数",
                },
              },
              required: ["workflow_id"],
            },
          },
          {
            name: "generate_template",
            description: "生成iter8模板文档",
            inputSchema: {
              type: "object",
              properties: {
                template_type: {
                  type: "string",
                  description: "模板类型 (如: prd, user-story, architecture等)",
                },
                variables: {
                  type: "object",
                  description: "模板变量",
                },
                interactive: {
                  type: "boolean",
                  description: "是否启用交互式信息收集",
                  default: true,
                },
              },
              required: ["template_type"],
            },
          },
          {
            name: "get_project_context",
            description: "获取项目上下文信息",
            inputSchema: {
              type: "object",
              properties: {
                include_git: {
                  type: "boolean",
                  description: "是否包含Git信息",
                  default: true,
                },
                include_files: {
                  type: "boolean",
                  description: "是否包含文件结构",
                  default: true,
                },
              },
            },
          },
          {
            name: "facilitate_collaboration",
            description: "促进角色间协作",
            inputSchema: {
              type: "object",
              properties: {
                from_role: {
                  type: "string",
                  description: "发起协作的角色ID",
                },
                to_role: {
                  type: "string",
                  description: "目标协作角色ID",
                },
                task: {
                  type: "string",
                  description: "协作任务描述",
                },
                context: {
                  type: "object",
                  description: "协作上下文",
                },
              },
              required: ["from_role", "to_role", "task"],
            },
          },
          {
            name: "tech_stack_consultation",
            description: "技术栈选型咨询 (@鲁班专用增强功能)",
            inputSchema: {
              type: "object",
              properties: {
                project_type: {
                  type: "string",
                  description: "项目类型 (如: web应用, 移动应用, API服务等)",
                },
                requirements: {
                  type: "object",
                  description: "项目需求和约束条件",
                },
                team_skills: {
                  type: "array",
                  items: { type: "string" },
                  description: "团队技能列表",
                },
                budget_constraints: {
                  type: "string",
                  description: "预算约束",
                },
                timeline: {
                  type: "string",
                  description: "时间线要求",
                },
              },
              required: ["project_type", "requirements"],
            },
          },
          {
            name: "declare_thinking_mode",
            description: "声明当前思维模式 (基于RIPER-5协议)",
            inputSchema: {
              type: "object",
              properties: {
                mode: {
                  type: "string",
                  enum: ["RESEARCH", "INNOVATE", "PLAN", "EXECUTE", "REVIEW"],
                  description:
                    "思维模式 (RESEARCH/INNOVATE/PLAN/EXECUTE/REVIEW)",
                },
                context: {
                  type: "string",
                  description: "当前上下文信息",
                },
                reasoning: {
                  type: "string",
                  description: "选择此模式的推理依据",
                },
              },
              required: ["mode"],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: any) => {
        const { name, arguments: args } = request.params;

        try {
          switch (name) {
            case "activate_role":
              return await this.activateRole(args);
            case "start_workflow":
              return await this.startWorkflow(args);
            case "generate_template":
              return await this.generateTemplate(args);
            case "get_project_context":
              return await this.getProjectContext(args);
            case "facilitate_collaboration":
              return await this.facilitateCollaboration(args);
            case "tech_stack_consultation":
              return await this.techStackConsultation(args);
            case "declare_thinking_mode":
              return await this.declareThinkingMode(args);
            default:
              throw new McpError(ErrorCode.MethodNotFound, `未知工具: ${name}`);
          }
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `工具执行失败: ${
              error instanceof Error ? error.message : "未知错误"
            }`
          );
        }
      }
    );
  }

  // 激活角色
  private async activateRole(args: any) {
    const { trigger, context = "", user_request } = args;

    // 解析触发词找到对应角色
    const roleId = this.parseTrigger(trigger);
    if (!roleId) {
      throw new Error(`未识别的角色触发词: ${trigger}`);
    }

    const role = ITER8_ROLES[roleId];
    if (!role) {
      throw new Error(`角色不存在: ${roleId}`);
    }

    // 特殊处理：@鲁班的技术选型咨询
    if (roleId === "architect" && this.isTechStackRequest(user_request)) {
      return await this.handleArchitectTechStackRequest(
        role,
        user_request,
        context
      );
    }

    // 特殊处理：文档创建请求的交互式信息收集
    if (this.isDocumentCreationRequest(user_request)) {
      return await this.handleDocumentCreationRequest(
        role,
        user_request,
        context
      );
    }

    // 加载角色上下文
    const roleContext = await this.loadRoleContext(role);

    // 获取系统信息
    const systemInfo = await this.getSystemInfo();

    // 获取当前时间信息
    const timeInfo = this.getCurrentTimeInfo();

    return {
      content: [
        {
          type: "text",
          text: `# ${role.icon} ${role.name} 已激活

**${role.mythological_title}** | **${role.professional_title}**
*激活时间: ${timeInfo.chineseDateTime}*

## 🎯 角色能力
${role.capabilities.map((cap) => `- ${cap}`).join("\n")}

## 🤝 协作建议
${this.getCollaborationSuggestions(roleId)
  .map((suggestion) => `- ${suggestion}`)
  .join("\n")}

## ⚡ 可用操作
${this.getAvailableActions(roleId)
  .map((action) => `- ${action}`)
  .join("\n")}

---

## 📋 项目信息收集模板

${this.getProjectInfoTemplate()}

---

*如需查看详细系统信息，请使用 \`*get_project_context\` 命令*`,
        },
      ],
    };
  }

  // 解析触发词
  private parseTrigger(trigger: string): string | null {
    for (const [roleId, role] of Object.entries(ITER8_ROLES)) {
      if (role.triggers.some((t) => trigger.includes(t))) {
        return roleId;
      }
    }
    return null;
  }

  // 加载角色prompt文件
  private async loadRolePrompt(roleId: string): Promise<string | null> {
    try {
      const promptPath = ROLE_FILE_MAPPING[roleId];
      if (!promptPath) {
        throw new Error(`未找到角色 ${roleId} 的prompt文件映射`);
      }

      const fullPath = path.join(process.cwd(), promptPath);
      const exists = await fs
        .access(fullPath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        const content = await fs.readFile(fullPath, "utf8");
        return content;
      } else {
        console.warn(`角色prompt文件不存在: ${fullPath}`);
        return null;
      }
    } catch (error) {
      console.error(`加载角色prompt文件失败: ${error}`);
      return null;
    }
  }

  // 加载角色配置文件
  private async loadRoleConfig(roleId: string): Promise<any | null> {
    try {
      const configPath = path.join(
        process.cwd(),
        this.roleDefinitionsPath,
        `${roleId}.yml`
      );
      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        const content = await fs.readFile(configPath, "utf8");
        return yaml.load(content);
      } else {
        console.warn(`角色配置文件不存在: ${configPath}`);
        return null;
      }
    } catch (error) {
      console.error(`加载角色配置文件失败: ${error}`);
      return null;
    }
  }

  // 加载角色上下文
  private async loadRoleContext(role: Iter8Role): Promise<any> {
    const loadedContext: any = {
      role_prompt: null,
      role_config: null,
      auto_loaded_docs: [],
      system_info: await this.getSystemInfo(),
    };

    // 加载角色prompt文件
    loadedContext.role_prompt = await this.loadRolePrompt(role.id);

    // 加载角色配置文件
    loadedContext.role_config = await this.loadRoleConfig(role.id);

    // 加载自动上下文文档
    for (const contextType of role.auto_load_context) {
      try {
        // 尝试加载相关文档和配置
        const contextPath = path.join(
          process.cwd(),
          DEFAULT_PATHS.DOCS_PATH,
          contextType
        );
        const exists = await fs
          .access(contextPath)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          loadedContext.auto_loaded_docs.push({
            type: contextType,
            status: "已加载",
            path: contextPath,
          });
        } else {
          loadedContext.auto_loaded_docs.push({
            type: contextType,
            status: "未找到",
            path: contextPath,
          });
        }
      } catch (error) {
        loadedContext.auto_loaded_docs.push({
          type: contextType,
          status: "加载失败",
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
    }

    return loadedContext;
  }

  // 获取系统信息
  private async getSystemInfo() {
    try {
      const gitBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
      const gitCommit = execSync('git log -1 --format="%H %s"', {
        encoding: "utf8",
      }).trim();
      const gitUser = execSync("git config user.name", {
        encoding: "utf8",
      }).trim();

      return {
        current_time: new Date().toISOString(),
        git_branch: gitBranch,
        latest_commit: gitCommit,
        git_user: gitUser,
        project_path: process.cwd(),
      };
    } catch (error) {
      return {
        current_time: new Date().toISOString(),
        project_path: process.cwd(),
        git_error: "Git信息获取失败",
      };
    }
  }

  // 获取协作建议
  private getCollaborationSuggestions(roleId: string): string[] {
    const collaborationMap: Record<string, string[]> = {
      po: ["与嫦娥协作用户体验设计", "与文殊菩萨协作需求分析"],
      "ux-expert": ["与姜尚协作产品需求理解", "与鲁班协作前端架构设计"],
      architect: ["与文殊菩萨协作数据架构设计", "与哪吒协作实现方案设计"],
      analyst: ["与姜尚协作需求澄清", "与鲁班协作技术可行性分析"],
      dev: ["与鲁班协作架构实现", "与杨戬协作代码质量保证"],
      qa: ["与哪吒协作代码质量", "与姜尚协作验收测试"],
      master: ["指导各层级敏捷实践", "与元始天尊协作团队协调"],
      orchestrator: ["协调所有角色", "统筹项目整体进度"],
    };

    return collaborationMap[roleId] || [];
  }

  // 获取可用操作
  private getAvailableActions(roleId: string): string[] {
    const actionsMap: Record<string, string[]> = {
      po: [
        "deep_research",
        "collect_user_insights",
        "refine_requirements",
        "create_prd",
        "create_epic",
        "create_user_story",
        "validate_business_value",
        "apply_multidimensional_thinking",
      ],
      "ux-expert": [
        "multidimensional_ux_research",
        "analyze_user_emotions",
        "explore_innovative_ux",
        "validate_ux_assumptions",
        "create_user_research",
        "create_ux_specification",
        "design_user_flow",
        "apply_multidimensional_ux_thinking",
      ],
      architect: [
        "design_system_architecture",
        "select_technology_stack",
        "design_api_specification",
      ],
      analyst: [
        "analyze_requirements",
        "create_business_model",
        "design_data_model",
      ],
      dev: ["implement_feature", "solve_technical_issue", "setup_environment"],
      qa: ["create_test_strategy", "execute_testing", "analyze_quality"],
      master: ["guide_agile_process", "coach_team", "facilitate_ceremony"],
      orchestrator: [
        "coordinate_team",
        "manage_resources",
        "support_decisions",
      ],
    };

    return actionsMap[roleId] || [];
  }

  // 启动工作流
  private async startWorkflow(args: any) {
    const { workflow_id, inputs = {} } = args;

    try {
      // 使用配置的工作流路径加载工作流
      const workflowPath = path.join(
        process.cwd(),
        this.workflowsPath,
        `${workflow_id}.yml`
      );
      const workflowContent = await fs.readFile(workflowPath, "utf8");
      const workflow = yaml.load(workflowContent) as any;

      // 获取当前时间信息
      const timeInfo = this.getCurrentTimeInfo();

      // 创建执行ID
      const executionId = `${workflow_id}-${Date.now()}`;

      // 获取第一步
      const firstStep = workflow.workflow?.sequence?.[0];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                workflow_started: true,
                workflow_id,
                execution_id: executionId,
                start_time: timeInfo.currentDateTime,
                workflow_name: workflow.workflow?.name || workflow_id,
                description: workflow.workflow?.description || "工作流描述",
                participants:
                  workflow.workflow?.sequence?.map((step: any) => step.agent) ||
                  [],
                estimated_duration:
                  workflow.workflow?.estimated_duration || "未指定",
                status: "running",
                current_step: firstStep?.step || null,
                next_action: firstStep
                  ? `激活${firstStep.agent}角色执行${firstStep.action}`
                  : "等待配置",
                message: `工作流 ${
                  workflow.workflow?.name || workflow_id
                } 已启动 (${timeInfo.chineseDateTime})`,
                time_info: {
                  start_date: timeInfo.currentDate,
                  start_time: timeInfo.currentDateTime,
                  chinese_time: timeInfo.chineseDateTime,
                  timestamp: timeInfo.fullTimestamp,
                },
                steps: workflow.workflow?.sequence || [],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      // 返回错误信息
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                workflow_started: false,
                workflow_id,
                error: `工作流文件未找到: ${workflow_id}.yml`,
                searched_paths: [`.iter8/workflows/${workflow_id}.yml`],
                available_workflows: await this.listAvailableWorkflows(),
                message: `工作流 ${workflow_id} 启动失败`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }

  // 列出可用工作流
  private async listAvailableWorkflows(): Promise<string[]> {
    const workflows: string[] = [];

    try {
      // 扫描.iter8/workflows/目录
      const iter8WorkflowsPath = path.join(
        process.cwd(),
        ".iter8",
        "workflows"
      );
      const iter8Files = await fs.readdir(iter8WorkflowsPath);
      workflows.push(
        ...iter8Files
          .filter((f: string) => f.endsWith(".yml"))
          .map((f: string) => f.replace(".yml", ""))
      );
    } catch (error) {
      // 目录不存在，忽略
    }

    // 不再扫描根目录的workflows/，因为已删除

    return [...new Set(workflows)]; // 去重
  }

  // 生成模板
  private async generateTemplate(args: any) {
    const { template_type, variables = {}, interactive = true } = args;

    try {
      // 1. 检查是否为需要信息收集的模板类型
      const requiresInfoCollection = [
        "prd",
        "project-brief",
        "epic",
        "story",
        "user-insights-collection",
        "requirement-refinement",
      ].includes(template_type);

      if (
        requiresInfoCollection &&
        (!variables || Object.keys(variables).length === 0)
      ) {
        // 返回信息收集模板
        const infoTemplate = this.getProjectInfoTemplate();
        return {
          content: [
            {
              type: "text",
              text: `⚠️ 创建 ${template_type} 文档前需要收集项目信息\n\n${infoTemplate}\n\n📝 请填写上述信息后，使用以下命令生成文档：\n\`\`\`\n*generate_template ${template_type} --variables '{\n  "projectName": "您的项目名称",\n  "projectManager": "真实负责人姓名",\n  "teamMembers": ["成员1", "成员2"],\n  "targetUsers": ["用户群体1", "用户群体2"],\n  "businessObjectives": ["目标1", "目标2"]\n}'\n\`\`\``,
            },
          ],
        };
      }

      // 2. 加载模板文件
      const templatePath = path.join(
        process.cwd(),
        this.templatesPath,
        `${template_type}-tmpl.md`
      );
      const templateContent = await fs.readFile(templatePath, "utf8");

      // 3. 处理模板变量
      const processedContent = this.processTemplateVariables(
        templateContent,
        variables
      );

      // 4. 生成文件名和路径
      const fileName = this.generateFileName(template_type);
      const filePath = path.join("docs", fileName);

      // 5. 保存文档
      await this.ensureDirectoryExists("docs");
      await fs.writeFile(filePath, processedContent, "utf8");

      // 6. 获取当前时间信息用于确认
      const timeInfo = this.getCurrentTimeInfo();

      return {
        content: [
          {
            type: "text",
            text: `✅ ${template_type} 文档已生成并保存到: ${filePath}\n\n📅 创建时间: ${
              timeInfo.currentDate
            } ${
              timeInfo.currentDateTime
            }\n\n🔍 文档预览:\n${processedContent.substring(
              0,
              500
            )}...\n\n✨ 文档特点:\n- 使用当前实际日期: ${
              timeInfo.currentDate
            }\n- 不包含AI角色信息\n- 基于您提供的真实项目信息`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 模板生成失败: ${
              error instanceof Error ? error.message : "未知错误"
            }`,
          },
        ],
      };
    }
  }

  private getCurrentTimeInfo() {
    const now = new Date();

    // 确保使用本地时区
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    return {
      currentDate: `${year}-${month}-${day}`,
      currentDateTime: `${year}-${month}-${day} ${hours}:${minutes}`,
      fullTimestamp: now.toISOString(),
      localTimestamp: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
      // 中文格式
      chineseDate: `${year}年${month}月${day}日`,
      chineseDateTime: `${year}年${month}月${day}日 ${hours}:${minutes}`,
      // 友好格式
      friendlyDate: now.toLocaleDateString("zh-CN"),
      friendlyDateTime: now.toLocaleString("zh-CN"),
    };
  }

  private processTemplateVariables(template: string, variables: any): string {
    // 获取当前时间信息
    const timeInfo = this.getCurrentTimeInfo();

    // 安全的变量映射 - 确保团队信息留白
    const safeVariables = {
      "{{项目名称}}": variables.projectName || "[待填写项目名称]",
      "{{项目代号}}":
        variables.projectCode || variables.projectName || "[待填写项目代号]",
      "{{创建日期}}": timeInfo.currentDate,
      "{{创建时间}}": timeInfo.currentDateTime,
      "{{当前日期}}": timeInfo.currentDate,
      "{{当前时间}}": timeInfo.currentDateTime,
      "{{项目负责人}}": this.sanitizePersonName(variables.projectManager),
      "{{团队成员}}": this.sanitizeTeamMembers(variables.teamMembers),
      "{{团队协作}}": this.sanitizeTeamMembers(variables.teamMembers),
      "{{项目描述}}": variables.projectDescription || "[待填写项目描述]",
      "{{目标用户}}":
        this.formatArray(variables.targetUsers) || "[待填写目标用户]",
      "{{业务目标}}":
        this.formatArray(variables.businessObjectives) || "[待填写业务目标]",
      "{{组织名称}}": variables.organization || "[待填写组织名称]",
      "{{部门}}": variables.department || "[待填写部门]",
      "{{文档版本}}": "v1.0",
      "{{生成时间}}": timeInfo.fullTimestamp,
      "{{年份}}": timeInfo.year,
      "{{月份}}": timeInfo.month,
      "{{日期}}": timeInfo.day,
    };

    // 执行变量替换
    let processed = template;
    for (const [placeholder, value] of Object.entries(safeVariables)) {
      const regex = new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g");
      processed = processed.replace(regex, value);
    }

    // 移除任何残留的AI角色引用
    processed = this.removeAIRoleReferences(processed);

    return processed;
  }

  private sanitizePersonName(name: any): string {
    if (!name || typeof name !== "string") {
      return "[待填写]";
    }

    const cleaned = name.trim();

    // 检查是否是AI角色名称，如果是则留白
    const aiRoleNames = [
      "姜尚",
      "嫦娥",
      "鲁班",
      "文殊菩萨",
      "哪吒",
      "杨戬",
      "太乙真人",
      "元始天尊",
      "李靖",
      "太公望",
      "产品负责人",
      "UX设计师",
      "技术架构师",
      "前端开发",
      "后端开发",
      "测试工程师",
    ];
    if (aiRoleNames.includes(cleaned)) {
      return "[待填写]";
    }

    return cleaned || "[待填写]";
  }

  private sanitizeTeamMembers(members: any): string {
    if (!members) return "[待填写团队成员]";

    if (typeof members === "string") {
      const memberList = members
        .split(/[,，、]/)
        .map((m) => this.sanitizePersonName(m.trim()));
      const validMembers = memberList.filter((m) => m !== "[待填写]");
      return validMembers.length > 0
        ? validMembers.join(", ")
        : "[待填写团队成员]";
    }

    if (Array.isArray(members)) {
      const validMembers = members
        .map((m) => this.sanitizePersonName(m))
        .filter((m) => m !== "[待填写]");
      return validMembers.length > 0
        ? validMembers.join(", ")
        : "[待填写团队成员]";
    }

    return "[待填写团队成员]";
  }

  private removeAIRoleReferences(content: string): string {
    // 定义所有AI角色名称
    const aiRoleNames = [
      "姜尚",
      "嫦娥",
      "鲁班",
      "文殊菩萨",
      "哪吒",
      "杨戬",
      "太乙真人",
      "元始天尊",
      "李靖",
    ];

    const aiRolePatterns = [
      // @角色名称
      /@姜尚/g,
      /@嫦娥/g,
      /@鲁班/g,
      /@文殊菩萨/g,
      /@哪吒/g,
      /@杨戬/g,
      /@太乙真人/g,
      /@元始天尊/g,
      /@李靖/g,

      // 文档创建者信息 - 最重要的修复
      /\*\*文档由.*?姜尚.*?创建.*?\*\*/g,
      /\*\*文档由.*?嫦娥.*?创建.*?\*\*/g,
      /\*\*文档由.*?鲁班.*?创建.*?\*\*/g,
      /\*\*文档由.*?文殊菩萨.*?创建.*?\*\*/g,
      /\*\*文档由.*?哪吒.*?创建.*?\*\*/g,
      /\*\*文档由.*?杨戬.*?创建.*?\*\*/g,
      /\*\*文档由.*?太乙真人.*?创建.*?\*\*/g,
      /\*\*文档由.*?元始天尊.*?创建.*?\*\*/g,
      /\*\*文档由.*?李靖.*?创建.*?\*\*/g,

      // 创建者、维护者信息
      /创建者.*?姜尚.*?/g,
      /创建者.*?嫦娥.*?/g,
      /创建者.*?鲁班.*?/g,
      /维护者.*?姜尚.*?/g,
      /维护者.*?嫦娥.*?/g,
      /维护者.*?鲁班.*?/g,

      // 角色名称（职位）格式
      /姜尚\s*（[^）]*）/g,
      /嫦娥\s*（[^）]*）/g,
      /鲁班\s*（[^）]*）/g,
      /文殊菩萨\s*（[^）]*）/g,
      /哪吒\s*（[^）]*）/g,
      /杨戬\s*（[^）]*）/g,
      /太乙真人\s*（[^）]*）/g,
      /元始天尊\s*（[^）]*）/g,
      /李靖\s*（[^）]*）/g,

      // 角色名称 (职位) 格式
      /姜尚\s*\([^)]*\)/g,
      /嫦娥\s*\([^)]*\)/g,
      /鲁班\s*\([^)]*\)/g,
      /文殊菩萨\s*\([^)]*\)/g,
      /哪吒\s*\([^)]*\)/g,
      /杨戬\s*\([^)]*\)/g,
      /太乙真人\s*\([^)]*\)/g,
      /元始天尊\s*\([^)]*\)/g,
      /李靖\s*\([^)]*\)/g,

      // 协作团队相关
      /协作团队.*?@\w+/g,
      /团队协作.*?@\w+/g,
      /@\w+\s*（[^）]*）/g,
      /@\w+\s*\([^)]*\)/g,

      // 单独的角色名称
      /(?:^|[^a-zA-Z\u4e00-\u9fff])姜尚(?![a-zA-Z\u4e00-\u9fff])/g,
      /(?:^|[^a-zA-Z\u4e00-\u9fff])嫦娥(?![a-zA-Z\u4e00-\u9fff])/g,
      /(?:^|[^a-zA-Z\u4e00-\u9fff])鲁班(?![a-zA-Z\u4e00-\u9fff])/g,
      /(?:^|[^a-zA-Z\u4e00-\u9fff])哪吒(?![a-zA-Z\u4e00-\u9fff])/g,
      /(?:^|[^a-zA-Z\u4e00-\u9fff])李靖(?![a-zA-Z\u4e00-\u9fff])/g,
    ];

    let cleaned = content;

    // 先处理文档创建者信息 - 完全删除这些行
    const documentCreatorPatterns = [
      /\*\*文档由.*?创建.*?\*\*/g,
      /\*创建者.*?\*/g,
      /\*维护者.*?\*/g,
      /\*最后更新.*?\*/g,
      /创建者[:：].*$/gm,
      /维护者[:：].*$/gm,
      /文档创建者[:：].*$/gm,
      /文档维护者[:：].*$/gm,
    ];

    for (const pattern of documentCreatorPatterns) {
      cleaned = cleaned.replace(pattern, "");
    }

    // 处理其他AI角色模式
    for (const pattern of aiRolePatterns) {
      cleaned = cleaned.replace(pattern, (match) => {
        // 如果是文档创建者信息，完全删除
        if (
          match.includes("文档由") ||
          match.includes("创建") ||
          match.includes("维护")
        ) {
          return "";
        }
        // 其他情况保留前缀字符（如果有的话）
        const prefix = match.match(/^[^a-zA-Z\u4e00-\u9fff]/);
        return (prefix ? prefix[0] : "") + "[待填写]";
      });
    }

    // 再处理简单的角色名称替换
    for (const roleName of aiRoleNames) {
      const simplePattern = new RegExp(`\\b${roleName}\\b`, "g");
      cleaned = cleaned.replace(simplePattern, "[待填写]");
    }

    // 清理多余的空行
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

    return cleaned;
  }

  private formatArray(arr: any): string {
    if (!arr) return "";
    if (typeof arr === "string") return arr;
    if (Array.isArray(arr)) return arr.join(", ");
    return "";
  }

  private generateFileName(templateType: string): string {
    const timeInfo = this.getCurrentTimeInfo();
    // 使用更精确的时间戳，包含时分秒
    const timestamp = `${timeInfo.currentDate}-${timeInfo.hours}${timeInfo.minutes}${timeInfo.seconds}`;
    return `${templateType}-${timestamp}.md`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // 目录可能已存在
    }
  }

  private getProjectInfoTemplate(): string {
    const timeInfo = this.getCurrentTimeInfo();

    return `# 📋 项目信息收集模板

> 如需生成个性化文档，请填写以下信息

## 🎯 基本项目信息
- **项目名称**: _______________
- **项目简介**: _______________
- **项目类型**:
  - [ ] Web应用
  - [ ] 移动应用
  - [ ] 桌面应用
  - [ ] API/后端服务
  - [ ] 数据平台
  - [ ] 其他: _______________

## � 团队信息
- **项目负责人**: _______________
- **产品经理**: _______________
- **技术负责人**: _______________
- **UX设计师**: _______________
- **开发团队成员**: _______________
- **测试工程师**: _______________

## 🎯 业务信息
- **目标用户群体**: _______________
- **主要业务目标**: _______________
- **核心功能需求**: _______________
- **成功指标**: _______________
- **项目时间线**: _______________

## 🏢 组织信息
- **公司/组织名称**: _______________
- **部门**: _______________
- **项目发起人**: _______________
- **主要利益相关者**: _______________

---

## 📝 使用说明

填写完成后，使用以下命令生成文档：

\`\`\`
*generate_template prd --variables '{
  "projectName": "您的项目名称",
  "projectManager": "真实负责人姓名",
  "teamMembers": ["成员1", "成员2"],
  "targetUsers": ["用户群体1", "用户群体2"],
  "businessObjectives": ["目标1", "目标2"],
  "organization": "公司名称",
  "department": "部门名称"
}'
\`\`\`

⚠️ **重要提醒**：
- 请提供真实的团队成员姓名
- 不要使用AI角色名称
- 如果暂时没有确定的人员，请填写"待确定"
- 所有信息都可以后续修改

*模板生成时间: ${timeInfo.chineseDateTime}*`;
  }

  // 获取项目上下文
  private async getProjectContext(args: any) {
    const { include_git = true, include_files = true } = args;

    const context: any = {
      project_path: process.cwd(),
      timestamp: new Date().toISOString(),
    };

    if (include_git) {
      context.git_info = await this.getSystemInfo();
    }

    if (include_files) {
      // 简化的文件结构扫描
      context.file_structure = {
        has_package_json: await fs
          .access("package.json")
          .then(() => true)
          .catch(() => false),
        has_src_dir: await fs
          .access("src")
          .then(() => true)
          .catch(() => false),
        has_docs_dir: await fs
          .access("docs")
          .then(() => true)
          .catch(() => false),
        has_iter8_config: await fs
          .access(".iter8")
          .then(() => true)
          .catch(() => false),
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(context, null, 2),
        },
      ],
    };
  }

  // 促进协作
  private async facilitateCollaboration(args: any) {
    const { from_role, to_role, task, context = {} } = args;

    const fromRoleInfo = ITER8_ROLES[from_role];
    const toRoleInfo = ITER8_ROLES[to_role];

    if (!fromRoleInfo || !toRoleInfo) {
      throw new Error("角色不存在");
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              collaboration_facilitated: true,
              from_role: fromRoleInfo.name,
              to_role: toRoleInfo.name,
              task,
              collaboration_type: `${fromRoleInfo.layer} → ${toRoleInfo.layer}`,
              handoff_context: context,
              next_steps: [
                `${toRoleInfo.name}接收任务`,
                "执行协作任务",
                "反馈结果",
              ],
              message: `${fromRoleInfo.name}与${toRoleInfo.name}的协作已建立`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // 检测是否为技术选型请求
  private isTechStackRequest(request: string): boolean {
    const techKeywords = [
      "技术选型",
      "技术栈",
      "架构设计",
      "技术方案",
      "技术建议",
      "tech stack",
      "technology",
      "architecture",
      "framework",
      "选择技术",
      "推荐技术",
      "技术对比",
      "技术咨询",
    ];

    return techKeywords.some((keyword) =>
      request.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 检测是否为文档创建请求
  private isDocumentCreationRequest(request: string): boolean {
    const docKeywords = [
      "创建",
      "生成",
      "写",
      "制作",
      "文档",
      "PRD",
      "需求文档",
      "设计文档",
      "架构文档",
      "测试计划",
      "用户故事",
    ];

    return docKeywords.some((keyword) =>
      request.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 处理@鲁班的技术选型请求
  private async handleArchitectTechStackRequest(
    role: Iter8Role,
    request: string,
    context: string
  ) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              role_activated: true,
              role_info: {
                id: role.id,
                name: role.name,
                title: role.title,
                icon: role.icon,
                professional_title: role.professional_title,
              },
              consultation_type: "tech_stack_selection",
              message: `${role.name}已激活！我是${role.mythological_title}，现在为您提供专业的技术选型咨询。`,
              consultation_prompt: this.generateTechStackConsultationPrompt(
                request,
                context
              ),
              next_steps: [
                "收集项目技术需求",
                "分析团队技能和约束",
                "提供3-5个技术栈方案",
                "生成决策矩阵和风险评估",
                "制定实施路线图",
              ],
              available_actions: [
                "tech_stack_consultation",
                "architecture_design",
                "technology_comparison",
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // 处理文档创建请求的交互式信息收集
  private async handleDocumentCreationRequest(
    role: Iter8Role,
    request: string,
    context: string
  ) {
    const timeInfo = this.getCurrentTimeInfo();

    return {
      content: [
        {
          type: "text",
          text: `# 🎯 项目信息收集启动

**激活时间**: ${timeInfo.currentDateTime}
**收集模式**: 交互式问答
**文档类型**: ${this.detectDocumentType(request)}

---

## 📋 信息收集流程

在创建任何文档之前，我需要通过对话收集完整的项目信息。

### 🔍 第一阶段：项目基础信息

请逐一回答以下问题：

1. **项目名称**: 请告诉我您的项目名称是什么？

2. **核心问题**: 您希望这个项目解决什么核心问题？

3. **目标用户**: 您的目标用户群体是谁？

4. **时间计划**: 您期望的项目上线时间是什么时候？

5. **团队资源**: 您的团队规模和预算范围大概是多少？

---

## ⚠️ 重要说明

- ✅ **所有信息都将通过对话收集**
- ✅ **文档将基于您提供的真实信息创建**
- ✅ **文档中不会包含任何AI角色信息**
- ✅ **使用您的真实姓名作为文档创建者**

请从第一个问题开始回答，我会根据您的回答继续深入了解项目需求。`,
        },
      ],
    };
  }

  // 生成技术选型咨询提示
  private generateTechStackConsultationPrompt(
    request: string,
    context: string
  ): string {
    return `## 🏗️ 技术栈选型咨询

您好！我是专业的系统架构师，很高兴为您提供技术选型咨询。

为了提供最适合的技术选型建议，我将为您提供：
- 3-5个可行的技术栈方案
- 详细的对比分析和决策矩阵
- 风险评估和迁移成本分析
- 实施路线图和最佳实践建议

### 📋 请提供以下信息：

1. **项目类型**: 这是什么类型的项目？（Web应用、移动应用、API服务等）
2. **项目规模**: 预期的用户规模和数据量？
3. **团队情况**: 团队规模和技术背景？
4. **性能要求**: 有特殊的性能要求吗？
5. **预算约束**: 预算方面有什么限制？
6. **时间线**: 项目的时间要求？
7. **特殊需求**: 有什么特殊的技术要求或约束？

**您的请求**: ${request}
${context ? `**上下文**: ${context}` : ""}

请详细回答这些问题，我将基于您的具体情况提供专业的技术选型建议。`;
  }

  // 检测文档类型
  private detectDocumentType(request: string): string {
    const lowerRequest = request.toLowerCase();

    if (lowerRequest.includes("prd") || lowerRequest.includes("产品需求")) {
      return "PRD (产品需求文档)";
    }
    if (
      lowerRequest.includes("用户故事") ||
      lowerRequest.includes("user story")
    ) {
      return "用户故事文档";
    }
    if (
      lowerRequest.includes("架构") ||
      lowerRequest.includes("architecture")
    ) {
      return "架构设计文档";
    }
    if (lowerRequest.includes("ux") || lowerRequest.includes("用户体验")) {
      return "UX设计文档";
    }
    if (lowerRequest.includes("调研") || lowerRequest.includes("research")) {
      return "产品调研文档";
    }

    return "项目文档";
  }

  // 生成信息收集提示
  private generateInfoCollectionPrompt(
    role: Iter8Role,
    request: string,
    context: string
  ): string {
    return `## 📋 ${role.title} - 信息收集

您好！我是专业的${role.title.split("·")[1] || role.title}，很高兴为您服务。

在开始创建文档之前，我需要收集一些关键信息以确保文档的准确性和实用性。
这个过程大约需要15-30分钟，但将确保最终文档的高质量。

### 🎯 基础信息收集

1. **您的姓名**: 为了在文档中正确署名，请提供您的真实姓名。
2. **项目名称**: 请告诉我这个项目的正式名称。
3. **项目背景**: 能简单介绍一下项目的业务背景和目标吗？
4. **项目类型**: 这是什么类型的项目？

**您的请求**: ${request}
${context ? `**上下文**: ${context}` : ""}

请先回答这些基础问题，我会根据您的回答进行更深入的信息收集。

**重要**: 我创建的文档将完全基于您提供的真实项目信息，确保专业性和可执行性。`;
  }

  // 技术栈咨询方法
  private async techStackConsultation(args: any) {
    const {
      project_type,
      requirements,
      team_skills = [],
      budget_constraints = "",
      timeline = "",
    } = args;

    // 生成技术栈方案
    const techStackOptions = this.generateTechStackOptions(
      project_type,
      requirements,
      team_skills
    );

    // 生成决策矩阵
    const decisionMatrix = this.generateDecisionMatrix(
      techStackOptions,
      requirements,
      team_skills
    );

    // 生成风险评估
    const riskAssessment = this.generateRiskAssessment(
      techStackOptions,
      requirements
    );

    // 生成实施路线图
    const roadmap = this.generateImplementationRoadmap(
      techStackOptions[0],
      requirements
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              consultation_completed: true,
              project_type,
              tech_stack_options: techStackOptions,
              decision_matrix: decisionMatrix,
              risk_assessment: riskAssessment,
              implementation_roadmap: roadmap,
              recommendations: this.generateRecommendations(
                techStackOptions,
                decisionMatrix
              ),
              next_steps: [
                "选择最适合的技术栈方案",
                "进行技术验证和原型开发",
                "制定详细的实施计划",
                "开始项目开发",
              ],
              message: "技术栈选型咨询完成，已提供全面的分析和建议",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // 启动服务器
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("iter8 MCP服务器已启动");
  }

  // 生成技术栈选项
  private generateTechStackOptions(
    projectType: string,
    requirements: any,
    teamSkills: string[]
  ) {
    const database = this.getTechStackDatabase();
    const projectKey = projectType.toLowerCase();
    const baseOptions = (database as any)[projectKey] || database["web"];

    return baseOptions.slice(0, 5).map((option: any) => ({
      ...option,
      team_fit_score: this.calculateTeamFitScore(option, teamSkills),
      complexity_adjusted: this.adjustComplexityForTeam(
        option.complexity,
        teamSkills
      ),
    }));
  }

  // 生成决策矩阵
  private generateDecisionMatrix(
    options: any[],
    requirements: any,
    teamSkills: string[]
  ) {
    const criteria = [
      "development_speed",
      "scalability",
      "maintainability",
      "team_expertise",
      "cost_effectiveness",
    ];
    const matrix: any = { criteria, options: {} };

    options.forEach((option) => {
      matrix.options[option.name] = {
        development_speed: this.scoreDevelopmentSpeed(option),
        scalability: this.scoreScalability(option),
        maintainability: this.scoreMaintainability(option),
        team_expertise: this.scoreTeamExpertise(option, teamSkills),
        cost_effectiveness: this.scoreCostEffectiveness(option),
        total_score: 0,
      };

      // 计算总分
      matrix.options[option.name].total_score = criteria.reduce(
        (sum, criterion) => sum + matrix.options[option.name][criterion],
        0
      );
    });

    return matrix;
  }

  // 生成风险评估
  private generateRiskAssessment(options: any[], requirements: any) {
    return options.map((option) => ({
      name: option.name,
      risks: [
        {
          type: "technical",
          level: option.complexity === "High" ? "High" : "Medium",
          description: "技术复杂度风险",
        },
        {
          type: "team",
          level: option.team_fit_score < 0.6 ? "High" : "Low",
          description: "团队技能匹配风险",
        },
        {
          type: "timeline",
          level: option.learning_curve === "High" ? "High" : "Medium",
          description: "学习曲线风险",
        },
        {
          type: "cost",
          level: option.cost === "High" ? "High" : "Low",
          description: "成本控制风险",
        },
      ],
      mitigation_strategies: this.generateMitigationStrategies(option),
    }));
  }

  // 生成实施路线图
  private generateImplementationRoadmap(topOption: any, requirements: any) {
    return {
      recommended_option: topOption.name,
      phases: [
        {
          phase: 1,
          name: "环境搭建与验证",
          duration: "1-2周",
          tasks: ["开发环境配置", "技术栈验证", "Hello World项目", "团队培训"],
        },
        {
          phase: 2,
          name: "核心架构开发",
          duration: "2-4周",
          tasks: ["基础架构搭建", "核心模块开发", "API设计", "数据库设计"],
        },
        {
          phase: 3,
          name: "功能开发",
          duration: "4-8周",
          tasks: ["业务功能实现", "前端界面开发", "集成测试", "性能优化"],
        },
        {
          phase: 4,
          name: "部署上线",
          duration: "1-2周",
          tasks: ["生产环境部署", "监控配置", "文档完善", "团队交接"],
        },
      ],
      success_criteria: [
        "技术验证通过",
        "团队熟练掌握",
        "性能达标",
        "按时交付",
      ],
    };
  }

  // 生成推荐建议
  private generateRecommendations(options: any[], decisionMatrix: any) {
    const sortedOptions = Object.entries(decisionMatrix.options)
      .sort(([, a]: any, [, b]: any) => b.total_score - a.total_score)
      .map(([name]) => name);

    return {
      primary_recommendation: sortedOptions[0],
      alternative_options: sortedOptions.slice(1, 3),
      reasoning: `基于项目需求和团队能力分析，${sortedOptions[0]}在综合评分中表现最佳`,
      next_actions: [
        "进行技术验证POC",
        "评估团队培训需求",
        "制定详细实施计划",
        "开始项目开发",
      ],
    };
  }

  // 技术栈数据库
  private getTechStackDatabase() {
    return {
      web: [
        {
          name: "React + Node.js + PostgreSQL",
          description: "现代全栈Web应用方案",
          technologies: {
            frontend: ["React", "TypeScript"],
            backend: ["Node.js", "Express"],
            database: ["PostgreSQL"],
          },
          complexity: "Medium",
          cost: "Medium",
          learning_curve: "Medium",
          scalability: "High",
          pros: ["快速开发", "丰富生态", "高性能"],
          cons: ["学习曲线", "版本更新快"],
        },
        {
          name: "Vue.js + Python Django + MySQL",
          description: "稳定可靠的企业级方案",
          technologies: {
            frontend: ["Vue.js", "Vuex"],
            backend: ["Python", "Django"],
            database: ["MySQL"],
          },
          complexity: "Low",
          cost: "Low",
          learning_curve: "Low",
          scalability: "Medium",
          pros: ["学习简单", "文档完善", "稳定可靠"],
          cons: ["性能一般", "生态相对小"],
        },
      ],
      mobile: [
        {
          name: "React Native",
          description: "跨平台移动应用开发",
          technologies: {
            frontend: ["React Native", "JavaScript"],
            backend: ["Node.js"],
            database: ["Firebase"],
          },
          complexity: "Medium",
          cost: "Medium",
          learning_curve: "Medium",
          scalability: "High",
          pros: ["跨平台", "代码复用", "快速开发"],
          cons: ["性能限制", "平台差异"],
        },
      ],
    };
  }

  // 辅助评分方法
  private calculateTeamFitScore(option: any, teamSkills: string[]): number {
    if (!teamSkills.length) return 0.5;

    const requiredSkills = [
      ...(option.technologies.frontend || []),
      ...(option.technologies.backend || []),
      ...(option.technologies.database || []),
    ];

    const matchingSkills = teamSkills.filter((skill) =>
      requiredSkills.some((tech) =>
        tech.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return matchingSkills.length / requiredSkills.length;
  }

  private adjustComplexityForTeam(
    complexity: string,
    teamSkills: string[]
  ): string {
    const teamFitScore = this.calculateTeamFitScore(
      { technologies: { frontend: teamSkills } },
      teamSkills
    );

    if (teamFitScore > 0.7) {
      return complexity === "High"
        ? "Medium"
        : complexity === "Medium"
        ? "Low"
        : complexity;
    }

    return complexity;
  }

  private scoreDevelopmentSpeed(option: any): number {
    const speedMap: any = { Low: 3, Medium: 6, High: 9 };
    return speedMap[option.complexity] || 5;
  }

  private scoreScalability(option: any): number {
    const scaleMap: any = { Low: 3, Medium: 6, High: 9 };
    return scaleMap[option.scalability] || 5;
  }

  private scoreMaintainability(option: any): number {
    return (
      option.pros.filter((pro: string) => pro.includes("维护")).length * 2 + 5
    );
  }

  private scoreTeamExpertise(option: any, teamSkills: string[]): number {
    return Math.round(this.calculateTeamFitScore(option, teamSkills) * 9);
  }

  private scoreCostEffectiveness(option: any): number {
    const costMap: any = { High: 3, Medium: 6, Low: 9 };
    return costMap[option.cost] || 5;
  }

  private generateMitigationStrategies(option: any): string[] {
    const strategies = [];

    if (option.complexity === "High") {
      strategies.push("提前进行技术验证和原型开发");
    }

    if (option.learning_curve === "High") {
      strategies.push("安排团队技术培训和知识分享");
    }

    if (option.cost === "High") {
      strategies.push("分阶段实施，控制成本投入");
    }

    strategies.push("建立完善的文档和最佳实践");

    return strategies;
  }

  // 声明思维模式
  private async declareThinkingMode(args: any) {
    const { mode, context = "", reasoning = "" } = args;

    const validModes = ["RESEARCH", "INNOVATE", "PLAN", "EXECUTE", "REVIEW"];

    if (!validModes.includes(mode)) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 无效的思维模式: ${mode}\n\n有效模式: ${validModes.join(
              ", "
            )}`,
          },
        ],
      };
    }

    const timeInfo = this.getCurrentTimeInfo();

    const modeDescriptions = {
      RESEARCH: "深度信息收集和系统性分析",
      INNOVATE: "创新方案探索和辩证评估",
      PLAN: "详细规划制定和系统性设计",
      EXECUTE: "严格按计划执行实施",
      REVIEW: "批判性审查和质量验证",
    };

    return {
      content: [
        {
          type: "text",
          text: `🧠 **[MODE: ${mode}]** 思维模式已激活

**模式说明**: ${modeDescriptions[mode as keyof typeof modeDescriptions]}
**激活时间**: ${timeInfo.currentDateTime}
**上下文**: ${context || "无特定上下文"}
**推理依据**: ${reasoning || "无特定推理"}

## 🎯 当前模式指导原则

${this.getThinkingModeGuidance(mode)}

---

*请在后续操作中严格遵循当前思维模式的原则和约束*`,
        },
      ],
    };
  }

  // 获取思维模式指导
  private getThinkingModeGuidance(mode: string): string {
    const guidance = {
      RESEARCH: `**允许**: 信息收集、需求挖掘、约束识别、现状分析
**禁止**: 方案推荐、解决方案设计、具体规划
**核心原则**: 系统性思维、全面性分析`,

      INNOVATE: `**允许**: 多方案探索、创新机会识别、利弊分析、可行性评估
**禁止**: 具体规划、实施细节、最终决策
**核心原则**: 创新思维、辩证思维`,

      PLAN: `**允许**: 详细规划、具体方案、实施路径、资源配置
**禁止**: 实施执行、方案修改
**核心原则**: 系统性思维、批判思维`,

      EXECUTE: `**允许**: 严格按计划实施、报告偏差、质量控制
**禁止**: 计划外修改、未报告的偏差
**核心原则**: 执行忠实性、质量保证`,

      REVIEW: `**允许**: 全面审查、质量验证、问题识别、改进建议
**禁止**: 新的实施、计划修改
**核心原则**: 批判思维、系统性验证`,
    };

    return guidance[mode as keyof typeof guidance] || "无指导信息";
  }
}

// 启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new Iter8MCPServer();
  server.run().catch(console.error);
}

export { Iter8MCPServer };
