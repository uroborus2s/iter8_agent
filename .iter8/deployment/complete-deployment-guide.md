# iter8敏捷团队AI代理系统 - 完整部署指南

> 🎭 **封神演义敏捷团队** - 从零到完整部署的详细指南  
> 版本: 2.0 | 更新日期: 2025-01-08

## 📋 部署概览

### 🎯 部署目标
- **Cursor IDE集成** - 通过.cursor-rules配置文件实现AI编程助手支持
- **Augment Code集成** - 通过MCP服务器提供深度代码上下文集成  
- **Gemini CLI集成** - 通过命令行工具提供批量操作和自动化支持
- **完整工作流自动化** - 实现四层敏捷架构的自动化流程执行

### 🏗️ 系统架构
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
│   └── deployment/                  # 部署配置
├── agent/                           # 8个角色的prompt定义
├── docs/                            # 项目文档
└── README.md                        # 项目说明
```

## 🚀 快速部署

### 第一步：环境准备

```bash
# 1. 检查环境要求
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
git --version   # >= 2.30.0

# 2. 克隆项目（如果需要）
git clone https://github.com/your-org/iter8_agent.git
cd iter8_agent

# 3. 设置环境变量
export ITER8_CONFIG_PATH="$(pwd)/.iter8"
export ITER8_TEMPLATES_PATH="$(pwd)/templates"
export ITER8_WORKFLOWS_PATH="$(pwd)/workflows"

# 4. 添加到shell配置文件
echo 'export ITER8_CONFIG_PATH="$(pwd)/.iter8"' >> ~/.bashrc
echo 'export ITER8_TEMPLATES_PATH="$(pwd)/templates"' >> ~/.bashrc
echo 'export ITER8_WORKFLOWS_PATH="$(pwd)/workflows"' >> ~/.bashrc
source ~/.bashrc
```

### 第二步：Cursor IDE集成部署

```bash
# 1. 复制Cursor规则文件到项目根目录
cp .iter8/integrations/cursor-ide/.cursor-rules ./

# 2. 验证配置文件
cat .cursor-rules | head -20

# 3. 重启Cursor IDE以加载新配置
# 在Cursor IDE中打开项目，配置将自动生效

# 4. 测试角色激活
# 在Cursor IDE中输入: @姜尚 为电商平台创建PRD
```

### 第三步：Augment Code MCP服务器部署

```bash
# 1. 进入MCP服务器目录
cd .iter8/integrations/augment-code/mcp-server

# 2. 安装依赖
npm install

# 3. 构建服务器
npm run build

# 4. 配置Augment Code
mkdir -p ~/.config/augment-code
cp ../augment-code-config.json ~/.config/augment-code/mcp-servers.json

# 5. 编辑配置文件，更新路径
nano ~/.config/augment-code/mcp-servers.json
# 将路径更新为实际的项目路径

# 6. 启动MCP服务器
npm start

# 7. 使用PM2管理服务器（推荐）
npm install -g pm2
pm2 start dist/index.js --name iter8-mcp-server
pm2 save
pm2 startup
```

### 第四步：Gemini CLI集成部署

```bash
# 1. 安装CLI工具依赖
cd .iter8/integrations/gemini-cli
npm install -g commander chalk inquirer js-yaml

# 2. 创建全局命令链接
chmod +x iter8-cli.js
sudo ln -s $(pwd)/iter8-cli.js /usr/local/bin/iter8

# 3. 验证安装
iter8 --version
iter8 --help

# 4. 测试基本功能
iter8 role list
iter8 role activate po
iter8 workflow list
```

## 🔧 详细配置

### Cursor IDE高级配置

```bash
# 1. 自定义快捷命令
# 在Cursor IDE设置中添加自定义命令：

# 角色激活快捷键
# Ctrl+Shift+P -> "iter8: 激活产品负责人" -> @姜尚
# Ctrl+Shift+U -> "iter8: 激活UX专家" -> @嫦娥
# Ctrl+Shift+A -> "iter8: 激活架构师" -> @鲁班

# 2. 工作区设置
# 创建 .vscode/settings.json
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "iter8.enabled": true,
  "iter8.autoLoadContext": true,
  "iter8.defaultRole": "po",
  "iter8.workflowAutoSuggest": true
}
EOF
```

### Augment Code MCP服务器高级配置

```bash
# 1. 创建详细的MCP配置
cat > ~/.config/augment-code/mcp-servers.json << 'EOF'
{
  "mcpServers": {
    "iter8-agile-team": {
      "command": "node",
      "args": ["/path/to/iter8_agent/.iter8/integrations/augment-code/mcp-server/dist/index.js"],
      "env": {
        "ITER8_CONFIG_PATH": "/path/to/iter8_agent/.iter8",
        "ITER8_TEMPLATES_PATH": "/path/to/iter8_agent/templates",
        "ITER8_WORKFLOWS_PATH": "/path/to/iter8_agent/workflows",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
EOF

# 2. 配置日志和监控
mkdir -p logs
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'iter8-mcp-server',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      ITER8_CONFIG_PATH: process.cwd() + '/../../../',
      LOG_LEVEL: 'info'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 3. 启动和监控
pm2 start ecosystem.config.js
pm2 monit
```

### Gemini CLI高级配置

```bash
# 1. 创建CLI配置文件
mkdir -p ~/.config/iter8
cat > ~/.config/iter8/config.yml << 'EOF'
version: "2.0"
default_project_path: "."
default_role: "po"
auto_load_context: true
interactive_mode: true
log_level: "info"

# 角色偏好设置
role_preferences:
  po:
    auto_load_prd: true
    default_template: "prd"
  ux-expert:
    auto_load_research: true
    default_template: "ux-specification"
  architect:
    auto_load_architecture: true
    default_template: "architecture"

# 工作流偏好
workflow_preferences:
  auto_suggest_next_step: true
  parallel_execution: false
  save_execution_history: true

# 模板偏好
template_preferences:
  auto_fill_system_info: true
  interactive_variable_collection: true
  save_variable_history: true
EOF

# 2. 创建别名和快捷命令
cat >> ~/.bashrc << 'EOF'
# iter8 CLI别名
alias i8='iter8'
alias i8r='iter8 role'
alias i8w='iter8 workflow'
alias i8t='iter8 template'

# 常用角色激活
alias po='iter8 role activate po'
alias ux='iter8 role activate ux-expert'
alias arch='iter8 role activate architect'
alias dev='iter8 role activate dev'
alias qa='iter8 role activate qa'
EOF

source ~/.bashrc
```

## 🧪 部署验证

### 集成测试执行

```bash
# 1. 运行完整集成测试
cd .iter8/tests
npm install
npm test

# 2. 验证Cursor IDE集成
# 在Cursor IDE中测试：
# - @姜尚 创建电商平台PRD
# - @嫦娥 设计用户登录流程
# - @鲁班 设计微服务架构

# 3. 验证Augment Code集成
# 检查MCP服务器状态
pm2 status iter8-mcp-server
pm2 logs iter8-mcp-server

# 在Augment Code中测试工具调用
# - activate_role
# - start_workflow  
# - generate_template

# 4. 验证Gemini CLI集成
iter8 role list
iter8 role activate po --interactive
iter8 workflow run product-documentation --interactive
iter8 template generate prd --interactive
```

### 性能基准测试

```bash
# 1. 角色激活性能测试
time iter8 role activate po
# 目标: < 2秒

# 2. 模板生成性能测试
time iter8 template generate prd --variables '{"project_name":"test"}'
# 目标: < 5秒

# 3. 工作流启动性能测试
time iter8 workflow run product-documentation
# 目标: < 3秒

# 4. MCP服务器响应测试
curl -X POST http://localhost:3000/health
# 目标: < 1秒响应
```

## 🔍 故障排除

### 常见问题解决

#### 1. Cursor IDE集成问题

```bash
# 问题：角色激活无响应
# 解决方案：
# 1. 检查.cursor-rules文件是否存在
ls -la .cursor-rules

# 2. 验证文件格式
head -20 .cursor-rules

# 3. 重启Cursor IDE
# 4. 清除Cursor缓存
rm -rf ~/.cursor/cache
```

#### 2. MCP服务器问题

```bash
# 问题：MCP服务器启动失败
# 解决方案：
# 1. 检查Node.js版本
node --version

# 2. 检查依赖安装
cd .iter8/integrations/augment-code/mcp-server
npm list

# 3. 检查端口占用
lsof -i :3000

# 4. 查看详细错误日志
pm2 logs iter8-mcp-server --lines 50
```

#### 3. CLI工具问题

```bash
# 问题：iter8命令未找到
# 解决方案：
# 1. 检查符号链接
ls -la /usr/local/bin/iter8

# 2. 重新创建链接
sudo ln -sf $(pwd)/.iter8/integrations/gemini-cli/iter8-cli.js /usr/local/bin/iter8

# 3. 检查执行权限
chmod +x .iter8/integrations/gemini-cli/iter8-cli.js

# 4. 验证Node.js路径
which node
```

## 📊 监控和维护

### 系统监控

```bash
# 1. 设置监控脚本
cat > scripts/monitor-iter8.sh << 'EOF'
#!/bin/bash
echo "=== iter8系统健康检查 ==="

# 检查MCP服务器状态
echo "MCP服务器状态:"
pm2 status iter8-mcp-server

# 检查CLI工具
echo "CLI工具状态:"
iter8 --version

# 检查配置文件
echo "配置文件状态:"
ls -la .cursor-rules
ls -la ~/.config/augment-code/mcp-servers.json
ls -la ~/.config/iter8/config.yml

# 检查日志
echo "最近错误日志:"
pm2 logs iter8-mcp-server --lines 10 --err
EOF

chmod +x scripts/monitor-iter8.sh

# 2. 设置定期检查
crontab -e
# 添加: 0 */6 * * * /path/to/iter8_agent/scripts/monitor-iter8.sh
```

### 定期维护

```bash
# 1. 日志清理
pm2 flush iter8-mcp-server

# 2. 缓存清理
rm -rf ~/.cursor/cache
rm -rf ~/.config/iter8/cache

# 3. 依赖更新
cd .iter8/integrations/augment-code/mcp-server
npm update

# 4. 配置备份
cp .cursor-rules .cursor-rules.backup
cp ~/.config/augment-code/mcp-servers.json ~/.config/augment-code/mcp-servers.json.backup
```

## 🎉 部署完成

恭喜！您已成功部署iter8敏捷团队AI代理系统。现在您可以：

### ✅ 立即开始使用

1. **在Cursor IDE中**：
   - 输入 `@姜尚 为我的项目创建PRD`
   - 输入 `@嫦娥 设计用户登录体验`
   - 输入 `@鲁班 设计系统架构`

2. **在Augment Code中**：
   - 使用MCP工具进行深度代码分析
   - 获取智能的敏捷开发建议
   - 自动化工作流执行

3. **在命令行中**：
   - `iter8 role activate po` - 激活产品负责人
   - `iter8 workflow run product-documentation` - 运行工作流
   - `iter8 template generate prd` - 生成PRD模板

### 🚀 探索高级功能

- **四层敏捷架构自动化**
- **跨角色智能协作**
- **动态模板系统**
- **完整的质量保证流程**

**开始您的智能化敏捷开发之旅吧！** 🎭✨
