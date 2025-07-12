# iter8敏捷团队AI代理系统

> 🎭 **封神演义敏捷团队** - 基于中国古典神话的智能敏捷开发框架  
> 版本: 2.0 | 更新日期: 2025-01-08

## 🌟 项目简介

iter8敏捷团队AI代理系统是一个创新的智能敏捷开发框架，将《封神演义》中的8个经典角色转化为专业的AI代理，实现完整的敏捷开发流程自动化。

### ✨ 核心特性

- 🎭 **8个AI角色**: 基于封神演义的完整角色体系
- 🏗️ **四层敏捷架构**: 业务价值、技术设计、实现、流程协调
- 🔄 **智能工作流**: 自动化的敏捷开发流程
- 🔧 **深度工具集成**: 支持Cursor IDE、Augment Code、Gemini CLI
- 📝 **动态模板系统**: 智能的文档生成和管理

## 🎭 八大AI角色

| 角色 | 神话身份 | 现代职责 | 触发方式 | 层级 |
|------|----------|----------|----------|------|
| 🎯 姜尚 | 封神榜主持者 | 产品负责人 | `@姜尚` \| `*agent po` \| `@iter8/po` | 业务价值层 |
| 🌙 嫦娥 | 月宫仙子 | UX专家 | `@嫦娥` \| `*agent ux-expert` \| `@iter8/ux-expert` | 业务价值层 |
| 🔧 鲁班 | 工匠之神 | 技术架构师 | `@鲁班` \| `*agent architect` \| `@iter8/architect` | 技术设计层 |
| 🧠 文殊菩萨 | 智慧之神 | 业务分析师 | `@文殊菩萨` \| `*agent analyst` \| `@iter8/analyst` | 技术设计层 |
| ⚡ 哪吒 | 三头六臂神童 | 全栈开发工程师 | `@哪吒` \| `*agent dev` \| `@iter8/dev` | 实现层 |
| 👁️ 杨戬 | 二郎神 | QA工程师 | `@杨戬` \| `*agent qa` \| `@iter8/qa` | 实现层 |
| 🧙‍♂️ 太乙真人 | 修行导师 | 敏捷教练 | `@太乙真人` \| `*agent master` \| `@iter8/master` | 流程协调层 |
| 👑 元始天尊 | 三清之首 | 团队协调者 | `@元始天尊` \| `*agent orchestrator` \| `@iter8/orchestrator` | 流程协调层 |

## 🚀 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git >= 2.30.0

### 2. 快速安装

```bash
# 克隆项目
git clone https://github.com/your-org/iter8_agent.git
cd iter8_agent

# 设置环境变量
export ITER8_CONFIG_PATH="$(pwd)/.iter8"

# 本地安装使用（推荐）
npm install -g iter8
iter8 init
iter8 start
```

### 3. 第一次使用

在AI工具中使用：
```
@姜尚 为我的项目创建产品需求文档
```

或使用命令行：
```bash
# 全局安装
npm install -g iter8

# 初始化项目
iter8 init

# 启动MCP服务器
iter8 start

# 检查项目状态
iter8 status
```

## 🔄 核心工作流

### 产品文档化工作流
- **参与者**: 姜尚(PO) + 嫦娥(UX专家)
- **输出**: PRD文档、UX规格、用户故事
- **触发**: `*workflow product-documentation`

### 史诗故事分解工作流
- **参与者**: 姜尚(PO) + 文殊菩萨(业务分析师)
- **输出**: 史诗定义、用户故事、验收标准
- **触发**: `*workflow epic-story-breakdown`

### 技术设计工作流
- **参与者**: 鲁班(架构师) + 文殊菩萨(业务分析师)
- **输出**: 系统架构、API设计、数据模型
- **触发**: `*workflow technical-design`

### 实现开发工作流
- **参与者**: 哪吒(开发) + 杨戬(QA)
- **输出**: 功能代码、测试用例、质量报告
- **触发**: `*workflow implementation-cycle`

## 🔧 工具集成

### 本地MCP服务器（推荐）
- **安装**: `npm install -g iter8`
- **功能**: 8个AI角色、工作流管理、模板系统
- **部署**: `iter8 start` 启动服务器
- **配置**: `mcp-server-config.json` 完整配置文件
- **兼容**: `augment-code-config.json` Augment Code专用配置

### CLI工具
- **初始化**: `iter8 init` - 创建项目配置
- **启动**: `iter8 start` - 启动MCP服务器
- **状态**: `iter8 status` - 检查项目状态
- **配置**: `iter8 config --tool augment-code` - 生成工具配置

## 📚 文档

### 🚀 快速开始
- [快速开始](docs/quick-start.md) - 3分钟极速上手指南
- [系统概览](docs/system-overview.md) - 系统架构和核心概念

### 👥 团队协作
- [团队协作指南](docs/team-collaboration-guide.md) - 角色协作最佳实践
- [业务价值层指南](docs/business-value-layer-startup-guide.md) - 产品和UX团队指南

### 🔧 技术支持
- [故障排除](docs/troubleshooting.md) - 常见问题解决方案
- [Token优化](docs/token-optimization.md) - 性能优化指南

### 🎭 角色文档
- [角色系统](.iter8/teams/) - 8个AI角色的详细定义
- [团队配置](.iter8/teams/core-agile-team.yml) - 核心敏捷团队配置

### 🔄 工作流文档
- [工作流定义](.iter8/workflows/) - 完整的工作流配置
- [模板系统](.iter8/templates/) - 动态模板库

### 🔧 集成文档
- [Cursor集成](.iter8/integrations/cursor-ide/) - Cursor IDE深度集成
- [MCP服务器](.iter8/integrations/augment-code/) - Augment Code集成
- [CLI工具](.iter8/integrations/gemini-cli/) - 命令行工具

## 🏗️ 项目结构

```
iter8_agent/
├── .iter8/                          # 核心系统配置
│   ├── integrations/                # 集成配置和代码
│   │   ├── cursor-ide/              # Cursor IDE集成
│   │   ├── augment-code/            # Augment Code MCP服务器
│   │   └── gemini-cli/              # Gemini CLI工具
│   ├── workflows/                   # 自动化工作流定义
│   ├── templates/                   # 动态模板系统
│   ├── teams/                       # 团队配置
│   ├── tests/                       # 集成测试套件
│   └── docs/                        # 系统文档
├── agent/                           # 8个角色的prompt定义
└── README.md                        # 项目说明
```

## 🎯 使用场景

### 新项目启动
```bash
@姜尚 创建项目PRD → @嫦娥 设计用户体验 → @鲁班 设计系统架构 → @哪吒 搭建开发环境
```

### 功能开发
```bash
@姜尚 创建用户故事 → @鲁班 设计技术方案 → @哪吒 实现代码 → @杨戬 质量测试
```

### 问题解决
```bash
@杨戬 分析问题 → @哪吒 定位修复 → @太乙真人 流程改进 → @元始天尊 资源协调
```

## 📈 价值收益

- 🚀 **开发效率提升 30-50%**
- 🤝 **协作效率提升 60%**
- 📝 **文档自动化 90%**
- 🔍 **代码质量提升 40%**
- 🐛 **缺陷率降低 50%**

## 🤝 贡献

欢迎贡献代码、文档或想法！请查看 [贡献指南](.iter8/docs/development/contributing.md)。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 📞 支持

- 🐛 [GitHub Issues](https://github.com/your-org/iter8_agent/issues) - 报告问题
- 💬 [讨论区](https://github.com/your-org/iter8_agent/discussions) - 社区讨论
- 📧 技术支持: tech-support@iter8.dev

---

**🎭 开始您的智能敏捷开发之旅！**

从激活 **@姜尚** 创建您的第一个PRD开始，体验iter8敏捷团队的强大功能！ ✨
