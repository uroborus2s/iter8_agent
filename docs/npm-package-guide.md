# iter8 MCP服务器 npm包使用指南

> 📦 **npm包部署** - 通过npx快速使用iter8敏捷团队AI代理  
> 版本: 0.0.1 | 更新日期: 2025-07-09

## 🚀 快速开始

### 方式1：npx直接使用（推荐）

```bash
# 初始化项目
npx @iter8/agile-team-mcp-server init

# 启动MCP服务器
npx @iter8/agile-team-mcp-server start

# 开发模式
npx @iter8/agile-team-mcp-server start --dev
```

### 方式2：全局安装

```bash
# 安装
npm install -g @iter8/agile-team-mcp-server

# 使用
iter8-mcp-server init
iter8-mcp-server start
```

## 🔧 MCP服务器运行模式详解

### 按需启动模式（推荐）

iter8 MCP服务器采用**按需启动**模式：

```bash
# AI工具调用时自动启动
AI工具 → 启动 npx @iter8/agile-team-mcp-server → 处理请求 → 退出

# 不需要常驻后台服务
# 每次调用都是独立的进程
# 无状态设计，配置通过环境变量传递
```

### 交互方式

- **协议**: MCP (Model Context Protocol) 1.0
- **传输**: stdio管道通信
- **连接**: 短连接，按需建立
- **状态**: 无状态，每次调用独立

## 📋 命令详解

### init - 项目初始化

```bash
npx @iter8/agile-team-mcp-server init
```

**功能**:
- 创建 `.iter8/` 目录结构
- 生成基础配置文件
- 创建 `mcp-config.json`

**生成的文件**:
```
.iter8/
├── config.yml          # 项目配置
├── agents/             # AI角色定义
├── workflows/          # 工作流定义
├── templates/          # 文档模板
└── teams/              # 团队配置

mcp-config.json         # MCP服务器配置
```

### start - 启动服务器

```bash
# 生产模式
npx @iter8/agile-team-mcp-server start

# 开发模式（详细日志）
npx @iter8/agile-team-mcp-server start --dev
```

**环境变量**:
- `ITER8_PROJECT_ROOT`: 项目根目录
- `ITER8_CONFIG_PATH`: 配置文件路径
- `NODE_ENV`: 运行环境
- `DEBUG`: 调试日志级别

### status - 状态检查

```bash
npx @iter8/agile-team-mcp-server status
```

**检查项目**:
- ✅ .iter8目录存在
- ✅ 配置文件完整
- ⚠️ MCP配置可选

### config - 生成配置

```bash
# Augment Code配置
npx @iter8/agile-team-mcp-server config --tool augment-code

# Cursor IDE配置
npx @iter8/agile-team-mcp-server config --tool cursor

# VSCode配置
npx @iter8/agile-team-mcp-server config --tool vscode
```

## 🔌 AI工具集成

### Augment Code集成

```bash
# 1. 初始化项目
npx @iter8/agile-team-mcp-server init

# 2. 生成配置
npx @iter8/agile-team-mcp-server config --tool augment-code

# 3. 配置Augment Code
cp augment-code-config.json ~/.augment/mcp-servers/

# 4. 重启Augment Code

# 5. 测试
# 在Augment Code中输入: @姜尚 创建产品需求文档
```

### Cursor IDE集成

```bash
# 1. 初始化项目
npx @iter8/agile-team-mcp-server init

# 2. 生成配置
npx @iter8/agile-team-mcp-server config --tool cursor

# 3. 配置Cursor IDE
# 将cursor-mcp-config.json内容添加到Cursor设置

# 4. 重启Cursor IDE
```

### VSCode集成

```bash
# 1. 安装MCP扩展
code --install-extension modelcontextprotocol.mcp

# 2. 初始化项目
npx @iter8/agile-team-mcp-server init

# 3. 生成配置
npx @iter8/agile-team-mcp-server config --tool vscode

# 4. 添加到settings.json
# 将vscode-settings.json内容合并到用户设置
```

## 🎭 使用示例

### 角色激活

```bash
# 产品负责人 - 创建PRD
@姜尚 为电商平台创建产品需求文档

# UX专家 - 设计界面
@嫦娥 设计用户登录界面的交互流程

# 系统架构师 - 技术选型
@鲁班 为微服务架构选择合适的技术栈

# 业务分析师 - 需求分析
@文殊菩萨 分析用户购买流程的业务需求

# 全栈开发 - 代码实现
@哪吒 实现用户认证功能

# 质量保证 - 测试策略
@杨戬 设计API接口的测试用例

# 敏捷教练 - 流程优化
@太乙真人 优化团队的敏捷开发流程

# 团队协调 - 项目管理
@元始天尊 协调团队完成Sprint规划
```

### 工作流执行

```bash
# 启动产品文档工作流
*workflow product-documentation

# 生成架构文档模板
*template architecture --project="电商平台"

# 获取项目上下文
*context --include-git --include-files
```

## 🔍 故障排除

### 常见问题

#### 1. npx命令失败

```bash
# 检查Node.js版本
node --version  # 需要 >= 18.0.0

# 清除npx缓存
npx clear-npx-cache

# 强制使用最新版本
npx @iter8/agile-team-mcp-server@latest init
```

#### 2. 配置文件不存在

```bash
# 重新初始化
npx @iter8/agile-team-mcp-server init

# 检查状态
npx @iter8/agile-team-mcp-server status
```

#### 3. AI工具连接失败

```bash
# 检查配置文件
cat mcp-config.json

# 测试服务器启动
npx @iter8/agile-team-mcp-server start --dev

# 检查环境变量
echo $ITER8_PROJECT_ROOT
```

#### 4. 权限问题

```bash
# 检查目录权限
ls -la .iter8/

# 修复权限
chmod -R 755 .iter8/
```

## 📊 性能优化

### 启动优化

```bash
# 使用本地缓存
npm config set cache ~/.npm-cache

# 预安装依赖
npm install -g @iter8/agile-team-mcp-server

# 使用已安装版本
iter8-mcp-server start
```

### 内存优化

```bash
# 设置Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=512"

# 启动服务器
npx @iter8/agile-team-mcp-server start
```

## 🔐 安全考虑

### 环境隔离

```bash
# 使用项目级配置
export ITER8_PROJECT_ROOT="$(pwd)"
export ITER8_CONFIG_PATH="$(pwd)/.iter8/config.yml"

# 避免全局配置污染
unset ITER8_GLOBAL_CONFIG
```

### 权限控制

```bash
# 限制文件访问
chmod 600 .iter8/config.yml

# 设置安全的环境变量
export NODE_ENV=production
unset DEBUG
```

## 📚 高级用法

### Docker集成

```dockerfile
FROM node:18-alpine
WORKDIR /workspace
COPY . .
RUN npm install -g @iter8/agile-team-mcp-server
CMD ["iter8-mcp-server", "start"]
```

### CI/CD集成

```yaml
# GitHub Actions
- name: Setup iter8
  run: |
    npx @iter8/agile-team-mcp-server init
    npx @iter8/agile-team-mcp-server status

- name: Generate docs
  run: |
    npx @iter8/agile-team-mcp-server start &
    # 使用AI工具生成文档
```

### 自定义配置

```bash
# 使用自定义配置路径
export ITER8_CONFIG_PATH="/custom/path/config.yml"
npx @iter8/agile-team-mcp-server start

# 使用环境特定配置
export NODE_ENV=staging
npx @iter8/agile-team-mcp-server start
```

## 🆘 获取帮助

### 命令帮助

```bash
npx @iter8/agile-team-mcp-server --help
npx @iter8/agile-team-mcp-server init --help
npx @iter8/agile-team-mcp-server start --help
```

### 社区支持

- **GitHub**: https://github.com/your-org/iter8_agent
- **Issues**: 报告问题和功能请求
- **Discussions**: 社区讨论和经验分享
- **Wiki**: 详细文档和教程
