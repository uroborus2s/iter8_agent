# iter8-version CLI工具使用指南

## 概述

`iter8-version` 是iter8_agent项目的完整语义化版本管理CLI工具，支持自动化版本升级、验证和同步功能。

## 安装

### 本地安装
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地链接（可选）
npm link
```

### 全局安装（发布后）
```bash
npm install -g @iter8/agile-team-mcp-server
```

## 命令概览

| 命令 | 描述 | 示例 |
|------|------|------|
| `current` | 显示当前版本信息 | `iter8-version current` |
| `validate` | 验证版本一致性 | `iter8-version validate` |
| `sync` | 同步版本到所有文件 | `iter8-version sync` |
| `bump` | 升级版本号 | `iter8-version bump patch` |
| `help` | 显示帮助信息 | `iter8-version help` |

## 详细命令说明

### 1. 显示当前版本信息
```bash
iter8-version current
```

**输出示例：**
```
📋 当前版本信息:

📦 package.json: 1.0.0-beta.1
🔧 MCP服务器: 1.0.0-beta.1
💻 配置版本: 1.0.0-beta.1

✅ 所有版本一致
```

### 2. 验证版本一致性
```bash
iter8-version validate
```

检查所有文件中的版本号是否一致，包括：
- package.json (version + mcp.version)
- .iter8/config.yml (mcp_server.version)
- src/index.ts (版本声明)
- 8个角色定义文件的版本注释

### 3. 同步版本
```bash
iter8-version sync
```

将配置文件中的版本号同步到所有相关文件。

### 4. 版本升级

#### 语义化版本类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `major` | 主版本（破坏性变更） | 1.0.0 → 2.0.0 |
| `minor` | 次版本（新功能） | 1.0.0 → 1.1.0 |
| `patch` | 补丁版本（错误修复） | 1.0.0 → 1.0.1 |
| `prerelease` | 预发布版本 | 1.0.0 → 1.0.1-beta.1 |

#### 基本升级命令

```bash
# 升级补丁版本
iter8-version bump patch

# 升级次版本
iter8-version bump minor

# 升级主版本
iter8-version bump major

# 升级预发布版本
iter8-version bump prerelease beta
iter8-version bump prerelease alpha
iter8-version bump prerelease rc
```

#### 高级选项

```bash
# 预览模式（默认）- 只显示变更，不执行
iter8-version bump patch --dry-run

# 执行实际更新
iter8-version bump patch --no-dry-run

# 交互式确认
iter8-version bump minor --interactive

# 创建Git标签
iter8-version bump patch --tag --no-dry-run

# 生成变更日志模板
iter8-version bump minor --changelog --no-dry-run

# 组合使用
iter8-version bump minor --no-dry-run --tag --changelog --interactive
```

## 使用场景

### 场景1: 日常开发中的补丁发布
```bash
# 1. 验证当前版本状态
iter8-version current

# 2. 预览补丁升级
iter8-version bump patch

# 3. 执行升级并创建标签
iter8-version bump patch --no-dry-run --tag
```

### 场景2: 新功能发布
```bash
# 1. 验证版本一致性
iter8-version validate

# 2. 交互式升级次版本
iter8-version bump minor --interactive --no-dry-run

# 3. 生成变更日志
iter8-version bump minor --changelog --no-dry-run
```

### 场景3: 预发布版本管理
```bash
# 创建beta版本
iter8-version bump prerelease beta --no-dry-run

# 升级到下一个beta版本
iter8-version bump prerelease --no-dry-run

# 从beta升级到rc
iter8-version bump prerelease rc --no-dry-run
```

### 场景4: 版本同步修复
```bash
# 如果版本不一致，先同步
iter8-version sync

# 然后验证
iter8-version validate
```

## 文件更新范围

CLI工具会自动更新以下文件中的版本号：

1. **package.json**
   - `version` 字段
   - `mcp.version` 字段

2. **.iter8/config.yml**
   - `integrations.augment_code.mcp_server.version` 字段

3. **src/index.ts**
   - MCP服务器类中的版本声明

4. **角色定义文件**
   - `.iter8/teams/role-definitions/*.yml` 文件头部的版本注释

5. **version-config.json**
   - 中央版本配置文件

## 错误处理

### 常见错误及解决方案

1. **版本不一致错误**
   ```bash
   # 解决方案：同步版本
   iter8-version sync
   ```

2. **无效版本格式**
   ```bash
   # 错误示例
   iter8-version bump invalid-type
   
   # 正确用法
   iter8-version bump patch
   ```

3. **Git标签创建失败**
   ```bash
   # 确保在Git仓库中且有提交权限
   git status
   ```

## 配置文件

### version-config.json
中央版本配置文件，包含：
- 当前版本号
- 版本历史
- 文件更新目标配置
- 语义化版本规则

### 自定义配置
可以通过修改 `version-config.json` 来自定义：
- 版本号格式
- 文件更新路径
- 变更日志模板

## 最佳实践

1. **升级前验证**
   ```bash
   iter8-version validate
   ```

2. **使用预览模式**
   ```bash
   iter8-version bump patch  # 默认为dry-run
   ```

3. **重要版本使用交互式确认**
   ```bash
   iter8-version bump major --interactive
   ```

4. **发布版本时创建标签**
   ```bash
   iter8-version bump minor --no-dry-run --tag --changelog
   ```

5. **定期同步版本**
   ```bash
   iter8-version sync
   ```

## 集成到CI/CD

### GitHub Actions示例
```yaml
- name: Bump version
  run: |
    iter8-version validate
    iter8-version bump patch --no-dry-run --tag
```

### npm scripts集成
```json
{
  "scripts": {
    "version:patch": "iter8-version bump patch --no-dry-run",
    "version:minor": "iter8-version bump minor --no-dry-run",
    "version:major": "iter8-version bump major --no-dry-run"
  }
}
```

## 故障排除

如果遇到问题，请按以下步骤排查：

1. 检查Node.js版本（需要>=18.0.0）
2. 确认所有依赖已安装：`npm install`
3. 验证文件权限：`ls -la bin/iter8-version.js`
4. 检查配置文件：`iter8-version current`
5. 运行验证：`iter8-version validate`
