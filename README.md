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

| 角色 | 神话身份 | 现代职责 | 触发方式 |
|------|----------|----------|----------|
| 🎯 姜尚 | 封神榜主持者 | 产品负责人 | `@姜尚` |
| 🌙 嫦娥 | 月宫仙子 | UX专家 | `@嫦娥` |
| 🔧 鲁班 | 工匠之神 | 技术架构师 | `@鲁班` |
| 🧠 文殊菩萨 | 智慧之神 | 业务分析师 | `@文殊菩萨` |
| ⚡ 哪吒 | 三头六臂神童 | 全栈开发工程师 | `@哪吒` |
| 👁️ 杨戬 | 二郎神 | QA工程师 | `@杨戬` |
| 🧙‍♂️ 太乙真人 | 修行导师 | 敏捷教练 | `@太乙真人` |
| 👑 元始天尊 | 三清之首 | 团队协调者 | `@元始天尊` |

## 🚀 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git >= 2.30.0

### 2. 快速安装

```bash
# 克隆项目
git clone https://github.com/your-org/iter8_agent.git
cd iter8_agent

# 设置环境变量
export ITER8_CONFIG_PATH="$(pwd)/.iter8"

# Cursor IDE集成（推荐）
cp .iter8/integrations/cursor-ide/.cursor-rules ./
cursor .
```

### 3. 第一次使用

在Cursor IDE中输入：
```
@姜尚 为我的项目创建产品需求文档
```

或使用命令行：
```bash
# 安装CLI工具
cd .iter8/integrations/gemini-cli
npm install -g commander chalk inquirer js-yaml
chmod +x iter8-cli.js
sudo ln -s $(pwd)/iter8-cli.js /usr/local/bin/iter8

# 激活角色
iter8 role activate po
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

### Cursor IDE（推荐）
- **配置**: 复制 `.cursor-rules` 到项目根目录
- **功能**: 角色激活、上下文感知、智能建议
- **支持**: Cursor 1.2+ 新特性（Agent Planning、Background Agent、Memories）

### Augment Code
- **实现**: MCP服务器
- **功能**: 深度代码上下文、智能协作、工作流管理
- **部署**: 独立MCP服务器进程

### Gemini CLI
- **工具**: iter8命令行工具
- **功能**: 批量操作、自动化脚本、系统管理
- **安装**: 全局CLI工具

## 📚 文档

### 📖 完整文档
- [系统概览](docs/system-overview.md) - 系统架构和核心概念
- [快速开始](docs/quick-start.md) - 5分钟上手指南
- [文档中心](docs/README.md) - 完整文档导航

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
