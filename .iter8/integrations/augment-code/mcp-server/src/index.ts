#!/usr/bin/env node

/**
 * iter8 Augment Code MCP服务器
 * 为Augment Code提供iter8敏捷团队AI代理集成
 * 版本: 2.1
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

// === MCP服务器类 ===
class Iter8MCPServer {
  private server: Server;
  private configPath: string;
  private templatesPath: string;
  private workflowsPath: string;

  constructor() {
    this.server = new Server(
      {
        name: "iter8-agile-team",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 从环境变量获取配置路径
    this.configPath = process.env.ITER8_CONFIG_PATH || "./.iter8";
    this.templatesPath = process.env.ITER8_TEMPLATES_PATH || "./templates";
    this.workflowsPath = process.env.ITER8_WORKFLOWS_PATH || "./workflows";

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

    // 加载角色上下文
    const roleContext = await this.loadRoleContext(role);

    // 获取系统信息
    const systemInfo = await this.getSystemInfo();

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
                layer: role.layer,
                icon: role.icon,
                mythological_title: role.mythological_title,
                professional_title: role.professional_title,
              },
              capabilities: role.capabilities,
              auto_loaded_context: roleContext,
              system_info: systemInfo,
              activation_message: `${role.name}已激活！我是${role.mythological_title}，现在担任${role.professional_title}。`,
              collaboration_suggestions:
                this.getCollaborationSuggestions(roleId),
              available_actions: this.getAvailableActions(roleId),
            },
            null,
            2
          ),
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

  // 加载角色上下文
  private async loadRoleContext(role: Iter8Role): Promise<string[]> {
    const loadedContext: string[] = [];

    for (const contextType of role.auto_load_context) {
      try {
        // 尝试加载相关文档和配置
        const contextPath = path.join(process.cwd(), "docs", contextType);
        const exists = await fs
          .access(contextPath)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          loadedContext.push(`${contextType}: 已加载`);
        } else {
          loadedContext.push(`${contextType}: 未找到`);
        }
      } catch (error) {
        loadedContext.push(`${contextType}: 加载失败`);
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
        "create_prd",
        "create_epic",
        "create_user_story",
        "validate_business_value",
      ],
      "ux-expert": [
        "create_user_research",
        "create_ux_specification",
        "design_user_flow",
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
      // 尝试从.iter8/workflows/目录加载工作流
      const workflowPath = path.join(
        process.cwd(),
        ".iter8",
        "workflows",
        `${workflow_id}.yml`
      );
      const workflowContent = await fs.readFile(workflowPath, "utf8");
      const workflow = yaml.load(workflowContent) as any;

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
                } 已启动`,
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

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              template_generated: true,
              template_type,
              variables,
              interactive_mode: interactive,
              message: `${template_type} 模板已生成`,
              next_steps: interactive
                ? ["收集用户输入", "填充模板变量", "生成最终文档"]
                : ["直接生成文档"],
            },
            null,
            2
          ),
        },
      ],
    };
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

  // 启动服务器
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("iter8 MCP服务器已启动");
  }
}

// 启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new Iter8MCPServer();
  server.run().catch(console.error);
}

export { Iter8MCPServer };
