#!/usr/bin/env node

/**
 * iter8 简化MCP服务器
 * 为Augment Code提供基础的iter8敏捷团队AI代理支持
 * 版本: 2.1
 * 创建日期: 2025-01-08
 */

// === 基础类型定义 ===
interface Iter8Role {
  id: string;
  name: string;
  title: string;
  icon: string;
  layer: string;
  level: number;
  triggers: string[];
  capabilities: string[];
  auto_load_context: string[];
}

// === iter8 核心角色定义 ===
const ITER8_ROLES: Record<string, Iter8Role> = {
  po: {
    id: "po",
    name: "姜尚",
    title: "产品负责人·封神榜主持者",
    icon: "🎯",
    layer: "business_value",
    level: 1,
    triggers: ["@姜尚", "*agent po", "@iter8/po"],
    capabilities: [
      "product_requirement_definition",
      "user_story_creation",
      "business_value_validation",
      "stakeholder_communication",
      "epic_planning",
      "product_roadmap",
    ],
    auto_load_context: ["prd", "epics", "user-stories", "business-metrics"],
  },
  "ux-expert": {
    id: "ux-expert",
    name: "嫦娥",
    title: "UX专家·月宫仙子",
    icon: "🌙",
    layer: "business_value",
    level: 2,
    triggers: ["@嫦娥", "*agent ux-expert", "@iter8/ux-expert"],
    capabilities: [
      "ux_design",
      "user_research",
      "prototype_creation",
      "usability_testing",
      "interaction_design",
      "design_system",
    ],
    auto_load_context: ["user-research", "ux-specs", "prototypes", "usability-tests"],
  },
  architect: {
    id: "architect",
    name: "鲁班",
    title: "技术架构师·工匠之神",
    icon: "🔧",
    layer: "technical_design",
    level: 3,
    triggers: ["@鲁班", "*agent architect", "@iter8/architect"],
    capabilities: [
      "system_architecture_design",
      "technology_selection",
      "api_design",
      "performance_planning",
      "scalability_design",
      "security_architecture",
    ],
    auto_load_context: ["system-architecture", "api-specs", "technology-stack", "infrastructure"],
  },
  analyst: {
    id: "analyst",
    name: "文殊菩萨",
    title: "业务分析师·智慧之神",
    icon: "🧠",
    layer: "technical_design",
    level: 4,
    triggers: ["@文殊菩萨", "*agent analyst", "@iter8/analyst"],
    capabilities: [
      "requirement_analysis",
      "business_modeling",
      "data_modeling",
      "process_optimization",
      "stakeholder_analysis",
    ],
    auto_load_context: ["requirements", "business-analysis", "market-research", "data-models"],
  },
  dev: {
    id: "dev",
    name: "哪吒",
    title: "全栈开发工程师·三头六臂神童",
    icon: "⚡",
    layer: "implementation",
    level: 5,
    triggers: ["@哪吒", "*agent dev", "@iter8/dev"],
    capabilities: [
      "code_implementation",
      "testing",
      "debugging",
      "performance_optimization",
      "technical_integration",
    ],
    auto_load_context: ["code-structure", "test-strategy", "implementation-guide", "dev-environment"],
  },
  qa: {
    id: "qa",
    name: "杨戬",
    title: "质量保证工程师·二郎神",
    icon: "👁️",
    layer: "implementation",
    level: 6,
    triggers: ["@杨戬", "*agent qa", "@iter8/qa"],
    capabilities: [
      "quality_assurance",
      "test_design",
      "defect_management",
      "automation_testing",
      "quality_metrics",
    ],
    auto_load_context: ["test-strategy", "quality-metrics", "bug-reports", "test-cases"],
  },
  master: {
    id: "master",
    name: "太乙真人",
    title: "敏捷教练·修行导师",
    icon: "🧙‍♂️",
    layer: "process_coordination",
    level: 7,
    triggers: ["@太乙真人", "*agent master", "@iter8/master"],
    capabilities: [
      "agile_coaching",
      "process_improvement",
      "team_building",
      "ceremony_facilitation",
      "continuous_improvement",
    ],
    auto_load_context: ["process-docs", "team-metrics", "retrospectives", "improvement-plans"],
  },
  orchestrator: {
    id: "orchestrator",
    name: "元始天尊",
    title: "团队协调者·三清之首",
    icon: "👑",
    layer: "process_coordination",
    level: 8,
    triggers: ["@元始天尊", "*agent orchestrator", "@iter8/orchestrator"],
    capabilities: [
      "workflow_orchestration",
      "resource_coordination",
      "decision_support",
      "cross_team_collaboration",
      "strategic_planning",
    ],
    auto_load_context: ["workflows", "team-status", "coordination-logs", "decision-records"],
  },
};

// === 核心工作流定义 ===
const ITER8_WORKFLOWS = [
  "product-documentation",
  "epic-story-breakdown", 
  "technical-design",
  "implementation-cycle",
  "quality-assurance",
  "user-research-insights",
];

// === 简化的MCP服务器类 ===
class SimpleIter8MCPServer {
  constructor() {
    console.log("🎭 iter8敏捷团队MCP服务器启动中...");
    this.setupServer();
  }

  setupServer() {
    // 模拟MCP服务器设置
    console.log("✅ MCP服务器配置完成");
    console.log("🎯 支持的角色:", Object.keys(ITER8_ROLES).join(", "));
    console.log("🔄 支持的工作流:", ITER8_WORKFLOWS.join(", "));
  }

  // 角色激活功能
  activateRole(roleId: string) {
    const role = ITER8_ROLES[roleId];
    if (!role) {
      throw new Error(`未知角色: ${roleId}`);
    }

    console.log(`🎭 激活角色: ${role.icon} ${role.name} - ${role.title}`);
    console.log(`📋 核心能力: ${role.capabilities.join(", ")}`);
    console.log(`📂 自动加载上下文: ${role.auto_load_context.join(", ")}`);
    
    return {
      role_id: role.id,
      role_name: role.name,
      role_title: role.title,
      icon: role.icon,
      layer: role.layer,
      capabilities: role.capabilities,
      auto_load_context: role.auto_load_context,
      activation_time: new Date().toISOString(),
      status: "activated"
    };
  }

  // 工作流启动功能
  startWorkflow(workflowId: string) {
    if (!ITER8_WORKFLOWS.includes(workflowId)) {
      throw new Error(`未知工作流: ${workflowId}`);
    }

    console.log(`🔄 启动工作流: ${workflowId}`);
    
    return {
      workflow_id: workflowId,
      status: "started",
      start_time: new Date().toISOString(),
      estimated_duration: "根据工作流复杂度而定",
      next_steps: "请按照工作流定义执行各个步骤"
    };
  }

  // 获取项目上下文
  getProjectContext() {
    return {
      project_name: "iter8_agent",
      project_type: "AI敏捷开发框架",
      team_structure: "8角色封神演义体系",
      architecture: "四层敏捷架构",
      supported_tools: ["Cursor IDE", "Augment Code", "Gemini CLI"],
      current_time: new Date().toISOString(),
      status: "active"
    };
  }

  // 协作促进功能
  facilitateCollaboration(participants: string[]) {
    const validRoles = participants.filter(p => ITER8_ROLES[p]);
    const invalidRoles = participants.filter(p => !ITER8_ROLES[p]);

    if (invalidRoles.length > 0) {
      console.warn(`⚠️ 无效角色: ${invalidRoles.join(", ")}`);
    }

    console.log(`🤝 促进协作: ${validRoles.map(r => ITER8_ROLES[r].name).join(" + ")}`);

    return {
      collaboration_id: `collab_${Date.now()}`,
      participants: validRoles.map(r => ({
        role_id: r,
        name: ITER8_ROLES[r].name,
        layer: ITER8_ROLES[r].layer
      })),
      collaboration_type: "cross_role_sync",
      start_time: new Date().toISOString(),
      status: "initiated"
    };
  }

  // 启动服务器
  start() {
    console.log("🚀 iter8 MCP服务器已启动");
    console.log("📡 等待Augment Code连接...");
    
    // 在实际实现中，这里会启动真正的MCP服务器
    // 目前只是模拟
    process.on('SIGINT', () => {
      console.log("\n👋 iter8 MCP服务器正在关闭...");
      process.exit(0);
    });
  }
}

// === 主程序入口 ===
if (require.main === module) {
  const server = new SimpleIter8MCPServer();
  server.start();
}

export { SimpleIter8MCPServer, ITER8_ROLES, ITER8_WORKFLOWS };
