# iter8敏捷团队AI代理系统 - 快速开始

> 🚀 **3分钟极速上手** - 专为新用户设计的零门槛入门指南
> 版本: 2.1 | 更新日期: 2025-01-08

## 🎯 选择你的身份，立即开始

### 🎨 我是产品经理/设计师
**你的AI伙伴**: 🎯 姜尚 (产品负责人) + 🌙 嫦娥 (UX专家)

**立即体验**:
```bash
# 在任何支持的工具中输入：
@姜尚 为电商平台创建产品需求文档

# 系统会自动：
✅ 激活产品负责人角色
✅ 加载PRD模板
✅ 收集项目信息
✅ 建议与UX专家协作
```

**你将得到**:
- 完整的产品需求文档 (PRD)
- 用户故事和验收标准
- 业务价值分析
- 下一步行动建议

---

### 💻 我是技术负责人/架构师
**你的AI伙伴**: 🔧 鲁班 (技术架构师) + 🧠 文殊菩萨 (业务分析师)

**立即体验**:
```bash
# 在任何支持的工具中输入：
@鲁班 为微服务电商平台设计系统架构

# 系统会自动：
✅ 激活技术架构师角色
✅ 加载架构模板
✅ 分析技术需求
✅ 建议与业务分析师协作
```

**你将得到**:
- 系统架构设计文档
- 技术栈选择建议
- API接口规范
- 性能和安全考虑

---

### ⚡ 我是开发工程师
**你的AI伙伴**: ⚡ 哪吒 (全栈开发) + 👁️ 杨戬 (QA工程师)

**立即体验**:
```bash
# 在任何支持的工具中输入：
@哪吒 实现用户认证功能

# 系统会自动：
✅ 激活开发工程师角色
✅ 加载代码模板
✅ 应用最佳实践
✅ 建议测试策略
```

**你将得到**:
- 完整的代码实现
- 单元测试用例
- 集成测试方案
- 代码质量检查

---

### 🎯 我是团队负责人/敏捷教练
**你的AI伙伴**: 🧙‍♂️ 太乙真人 (敏捷教练) + 👑 元始天尊 (团队协调者)

**立即体验**:
```bash
# 在任何支持的工具中输入：
@太乙真人 优化我们团队的敏捷流程

# 系统会自动：
✅ 激活敏捷教练角色
✅ 分析团队状况
✅ 提供改进建议
✅ 制定行动计划
```

**你将得到**:
- 团队效能分析
- 流程改进建议
- 敏捷仪式优化
- 持续改进计划

## 📋 前置要求

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: >= 2.30.0
- **操作系统**: macOS, Linux, Windows

### 推荐工具
- **Cursor IDE**: 最佳集成体验
- **Augment Code**: 深度代码上下文
- **VS Code**: 备选编辑器

## 🚀 快速安装

### 第一步：获取项目

```bash
# 如果您已有项目，跳过此步
git clone https://github.com/your-org/iter8_agent.git
cd iter8_agent
```

### 第二步：环境配置

```bash
# 设置环境变量
export ITER8_CONFIG_PATH="$(pwd)/.iter8"

# 添加到shell配置（可选）
echo 'export ITER8_CONFIG_PATH="$(pwd)/.iter8"' >> ~/.bashrc
source ~/.bashrc
```

### 第三步：选择集成方式

#### 🎯 推荐：Cursor IDE集成（最简单）

```bash
# 1. 复制配置文件到项目根目录
cp .iter8/integrations/cursor-ide/.cursor-rules ./

# 2. 在Cursor IDE中打开项目
cursor .

# 3. 测试角色激活
# 在Cursor中输入: @姜尚 为我的项目创建PRD
```

#### 🔧 高级：Augment Code MCP服务器

```bash
# 1. 进入MCP服务器目录
cd .iter8/integrations/augment-code/mcp-server

# 2. 安装依赖并构建
npm install
npm run build

# 3. 启动服务器
npm start

# 4. 配置Augment Code（参考集成文档）
```

#### 💻 命令行：Gemini CLI工具

```bash
# 1. 安装CLI依赖
cd .iter8/integrations/gemini-cli
npm install -g commander chalk inquirer js-yaml

# 2. 创建全局命令
chmod +x iter8-cli.js
sudo ln -s $(pwd)/iter8-cli.js /usr/local/bin/iter8

# 3. 测试CLI
iter8 --version
iter8 role list
```

## 🎭 第一次使用

### 激活您的第一个AI角色

#### 在Cursor IDE中：
```
@姜尚 为电商平台创建产品需求文档
```

#### 在命令行中：
```bash
iter8 role activate po
```

#### 在Augment Code中：
使用MCP工具 `activate_role` 激活角色

### 运行您的第一个工作流

#### 产品文档化工作流：
```
*workflow product-documentation
```

#### 或使用CLI：
```bash
iter8 workflow run product-documentation
```

## 🔍 验证安装

### 检查角色系统
```bash
# 列出所有可用角色
iter8 role list

# 应该看到8个角色：
# 🎯 姜尚 - 产品负责人·封神榜主持者
# 🌙 嫦娥 - UX专家·月宫仙子
# 🔧 鲁班 - 技术架构师·工匠之神
# 🧠 文殊菩萨 - 业务分析师·智慧之神
# ⚡ 哪吒 - 全栈开发工程师·三头六臂神童
# 👁️ 杨戬 - QA工程师·二郎神
# 🧙‍♂️ 太乙真人 - 敏捷教练·修行导师
# 👑 元始天尊 - 团队协调者·三清之首
```

### 检查工作流系统
```bash
# 列出所有可用工作流
iter8 workflow list

# 应该看到核心工作流：
# - product-documentation (产品文档化)
# - epic-story-breakdown (史诗故事分解)
# - technical-design (技术设计)
# - implementation-cycle (实现开发)
```

### 检查模板系统
```bash
# 生成测试模板
iter8 template generate prd --variables '{"project_name":"测试项目"}'

# 应该成功生成PRD模板
```

## 🎯 常用场景

### 场景1：新项目启动

```bash
# 1. 激活产品负责人创建PRD
@姜尚 为"智能客服系统"创建产品需求文档

# 2. 激活UX专家进行用户研究
@嫦娥 为智能客服系统设计用户体验

# 3. 激活架构师设计系统架构
@鲁班 为智能客服系统设计微服务架构
```

### 场景2：功能开发

```bash
# 1. 分解史诗为用户故事
*workflow epic-story-breakdown

# 2. 设计技术方案
*workflow technical-design

# 3. 开始开发实现
*workflow implementation-cycle
```

### 场景3：问题解决

```bash
# 1. QA分析问题
@杨戬 分析生产环境性能问题

# 2. 开发定位问题
@哪吒 定位并修复性能瓶颈

# 3. 敏捷教练分析流程
@太乙真人 分析问题产生的流程原因
```

## 🔧 自定义配置

### 团队偏好设置

创建 `.iter8/user-config.yml`:
```yaml
user_preferences:
  default_role: "po"
  auto_load_context: true
  interactive_mode: true
  
team_settings:
  team_size: 5
  sprint_length: "2周"
  communication_tools: ["Slack", "Teams"]
  
coding_preferences:
  language: "TypeScript"
  framework: "React"
  testing_framework: "Jest"
```

### 项目特定配置

创建 `.iter8/project-config.yml`:
```yaml
project:
  name: "我的项目"
  type: "web_app"
  technology_stack: ["React", "Node.js", "PostgreSQL"]
  
workflows:
  enabled: ["product-documentation", "technical-design"]
  auto_suggest: true
  
templates:
  auto_fill_system_info: true
  save_variable_history: true
```

## 🆘 故障排除

### 常见问题

#### 1. 角色激活无响应
```bash
# 检查配置文件
ls -la .cursor-rules

# 重启Cursor IDE
# 清除缓存
rm -rf ~/.cursor/cache
```

#### 2. MCP服务器启动失败
```bash
# 检查Node.js版本
node --version

# 重新安装依赖
cd .iter8/integrations/augment-code/mcp-server
rm -rf node_modules
npm install
npm run build
```

#### 3. CLI命令未找到
```bash
# 检查符号链接
ls -la /usr/local/bin/iter8

# 重新创建链接
sudo ln -sf $(pwd)/.iter8/integrations/gemini-cli/iter8-cli.js /usr/local/bin/iter8
```

## 📚 下一步

### 深入学习
- [系统概览](system-overview.md) - 了解完整的系统架构
- [角色系统文档](roles/overview.md) - 深入了解8个AI角色
- [工作流文档](workflows/overview.md) - 掌握敏捷工作流

### 高级功能
- [集成指南](integrations/overview.md) - 深度工具集成
- [自定义模板](templates/custom-templates.md) - 创建专属模板
- [开发者文档](development/environment-setup.md) - 参与项目开发

### 获取帮助
- [FAQ](help/faq.md) - 常见问题解答
- [故障排除](operations/troubleshooting.md) - 问题解决指南
- GitHub Issues - 报告问题和功能请求

---

**🎉 恭喜！您已成功安装iter8敏捷团队AI代理系统！**

现在您可以开始体验智能化的敏捷开发流程。建议从激活 **@姜尚** 创建您的第一个PRD开始！ 🎭✨
