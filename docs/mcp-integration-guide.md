# iter8 MCP服务器集成指南

> 🔌 **MCP协议集成** - 统一的AI工具集成方案  
> 版本: 0.0.1 | 更新日期: 2025-07-09

## 📋 概述

iter8_agent提供基于MCP (Model Context Protocol) 协议的统一集成方案，支持多种AI开发工具的无缝接入。

### 🎯 支持的工具
- **Augment Code** - 深度代码上下文集成
- **Cursor IDE** - 智能编程助手
- **VSCode** - 通过MCP扩展
- **其他MCP兼容工具**

## 🚀 快速开始

### 1. 环境准备

```bash
# 确保Node.js版本
node --version  # >= 18.0.0

# 确保pnpm版本
pnpm --version  # >= 8.0.0

# 如果没有pnpm，请安装
npm install -g pnpm
```

### 2. 安装iter8

```bash
# 全局安装
npm install -g iter8

# 验证安装
iter8 --version

# 初始化项目
iter8 init
```

### 3. 验证安装

```bash
# 检查项目状态
iter8 status

# 启动服务器（测试）
iter8 start --dev
```

## 🔧 集成配置

### Augment Code集成

#### 方法1：使用专用配置文件（推荐）

```bash
# 1. 复制配置文件到Augment Code配置目录
cp augment-code-config.json ~/.augment/mcp-servers/

# 2. 或者在Augment Code设置中添加：
```

```json
{
  "mcpServers": {
    "iter8-agile-team": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/iter8_agent",
      "env": {
        "ITER8_PROJECT_ROOT": ".",
        "NODE_ENV": "production"
      },
      "timeout": 30000,
      "retries": 3
    }
  }
}
```

#### 方法2：使用完整配置文件

```bash
# 使用完整的MCP配置
cp mcp-server-config.json ~/.augment/mcp-config.json
```

### Cursor IDE集成

#### 1. 通过MCP扩展

```bash
# 1. 安装MCP扩展（如果可用）
# 2. 配置MCP服务器
```

在Cursor IDE设置中添加：

```json
{
  "mcp.servers": {
    "iter8-agile-team": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/iter8_agent",
      "env": {
        "ITER8_PROJECT_ROOT": ".",
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 2. 项目级配置

在项目根目录创建 `.cursor/mcp.json`：

```json
{
  "servers": {
    "iter8-agile-team": {
      "command": "node",
      "args": ["index.js"],
      "cwd": ".",
      "env": {
        "ITER8_PROJECT_ROOT": ".",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### VSCode集成

```bash
# 1. 安装MCP扩展
code --install-extension modelcontextprotocol.mcp

# 2. 配置settings.json
```

在VSCode设置中添加：

```json
{
  "mcp.servers": {
    "iter8-agile-team": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/iter8_agent"
    }
  }
}
```

## 🎭 使用指南

### 角色激活

通过MCP协议激活iter8的8个AI角色：

```bash
# 产品负责人
@姜尚 创建产品需求文档

# UX专家
@嫦娥 设计用户界面

# 系统架构师
@鲁班 设计系统架构

# 业务分析师
@文殊菩萨 分析业务需求

# 全栈开发工程师
@哪吒 实现功能代码

# 质量保证工程师
@杨戬 设计测试策略

# 敏捷教练
@太乙真人 优化团队流程

# 团队编排器
@元始天尊 协调团队工作
```

### 工作流执行

```bash
# 启动工作流
*workflow product-documentation

# 生成模板
*template prd --project="我的项目"

# 获取项目上下文
*context --include-git --include-files
```

## 🔍 故障排除

### 常见问题

#### 1. 服务器启动失败

```bash
# 检查依赖
pnpm install

# 重新构建
pnpm run clean && pnpm run build

# 检查端口占用
lsof -i :stdio
```

#### 2. 连接超时

```bash
# 增加超时时间
# 在配置文件中设置更大的timeout值

# 检查网络连接
ping localhost
```

#### 3. 权限问题

```bash
# 检查文件权限
ls -la index.js

# 确保可执行权限
chmod +x index.js
```

### 调试模式

```bash
# 启用调试日志
DEBUG=iter8:* pnpm run mcp:start

# 或者设置环境变量
export DEBUG=iter8:*
pnpm run mcp:start
```

## 📊 性能优化

### 配置调优

```json
{
  "performance": {
    "memory_limit": "512MB",
    "cpu_limit": "50%",
    "request_timeout": 30000,
    "cache": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
```

### 监控指标

```bash
# 检查内存使用
ps aux | grep "node index.js"

# 检查CPU使用
top -p $(pgrep -f "node index.js")
```

## 🔐 安全配置

### 沙箱模式

```json
{
  "security": {
    "sandbox": {
      "enabled": true,
      "allowed_paths": [".", ".iter8", "docs"],
      "denied_paths": ["node_modules", ".git", ".env"]
    }
  }
}
```

### 访问控制

```json
{
  "security": {
    "authentication": {
      "enabled": true,
      "type": "token",
      "token": "your-secure-token"
    }
  }
}
```

## 📚 API参考

### 可用工具

- `activate_role` - 激活AI角色
- `start_workflow` - 启动工作流
- `generate_template` - 生成文档模板
- `get_project_context` - 获取项目上下文
- `facilitate_collaboration` - 促进角色协作

### 环境变量

- `ITER8_PROJECT_ROOT` - 项目根目录
- `ITER8_CONFIG_PATH` - 配置文件路径
- `ITER8_ROLES_PATH` - 角色定义路径
- `ITER8_WORKFLOWS_PATH` - 工作流路径
- `ITER8_TEMPLATES_PATH` - 模板路径
- `DEBUG` - 调试日志级别

## 🆘 获取帮助

### 社区支持
- GitHub Issues: 报告问题和功能请求
- 文档: [完整文档](../README.md)
- 示例: [集成示例](../examples/)

### 联系方式
- 项目主页: https://github.com/your-org/iter8_agent
- 邮箱: support@iter8.dev
