# iter8 故障排除指南

> 🔧 **快速解决常见问题** - 让你的iter8体验更顺畅  
> 版本: 2.1 | 更新日期: 2025-01-08

## 🚨 常见问题快速解决

### 角色激活问题

#### ❌ 问题：角色无法激活
**症状**: 输入`@姜尚`后没有响应或提示角色不存在

**可能原因**:
1. 角色名称拼写错误
2. 工具集成配置问题
3. 权限设置问题

**解决方案**:
```bash
# 1. 检查角色列表
iter8 role list

# 2. 验证配置
iter8 config validate

# 3. 重新激活
@姜尚 或 *agent po 或 @iter8/po

# 4. 如果仍然失败，重启工具
```

#### ❌ 问题：角色激活缓慢
**症状**: 角色激活需要超过5秒

**解决方案**:
```bash
# 1. 检查系统性能
iter8 performance check

# 2. 清理缓存
iter8 cache clear

# 3. 优化上下文加载
iter8 config set auto_context_loading false

# 4. 检查网络连接
iter8 doctor --network
```

### 工作流执行问题

#### ❌ 问题：工作流中断
**症状**: 工作流执行到一半停止，显示错误信息

**常见错误类型**:

1. **缺少前置文档**
   ```
   错误: 找不到 docs/prd.md
   解决: iter8 template generate prd
   ```

2. **权限不足**
   ```
   错误: 无权限创建文件
   解决: 检查文件夹权限，确保可写
   ```

3. **模板缺失**
   ```
   错误: 模板 prd-tmpl 不存在
   解决: iter8 template install --all
   ```

### 工具集成问题

#### ❌ 问题：Cursor IDE集成失败
**症状**: 在Cursor中无法激活iter8角色

**解决方案**:
```bash
# 1. 检查.cursor-rules文件
ls -la .cursor-rules

# 2. 验证配置语法
iter8 cursor validate

# 3. 重新安装配置
iter8 cursor install

# 4. 重启Cursor IDE
```

#### ❌ 问题：Augment Code MCP连接失败
**症状**: MCP服务器无法连接

**解决方案**:
```bash
# 1. 检查MCP服务器状态
iter8 mcp status

# 2. 重启MCP服务器
iter8 mcp restart

# 3. 检查端口占用
netstat -an | grep 3000

# 4. 重新配置连接
iter8 mcp configure
```

#### ❌ 问题：Gemini CLI命令不可用
**症状**: `iter8`命令找不到

**解决方案**:
```bash
# 1. 检查安装
which iter8

# 2. 重新安装
npm install -g @iter8/cli

# 3. 添加到PATH
export PATH=$PATH:/path/to/iter8

# 4. 验证安装
iter8 --version
```

## 🔍 诊断工具

### 系统健康检查
```bash
iter8 doctor
```
**输出示例**:
```
🔍 iter8 系统诊断报告

✅ 核心配置: 正常
✅ 角色定义: 8/8 可用
✅ 工作流: 7/7 可用
✅ 模板系统: 正常
⚠️  MCP服务器: 连接超时
❌ Cursor集成: 配置文件缺失

🛠️ 建议修复:
1. 重启MCP服务器: iter8 mcp restart
2. 安装Cursor配置: iter8 cursor install
```

### 详细日志查看
```bash
# 查看所有日志
iter8 logs

# 查看错误日志
iter8 logs --level error

# 查看特定组件日志
iter8 logs --component mcp-server

# 实时日志监控
iter8 logs --follow
```

### 配置验证
```bash
# 验证所有配置
iter8 config validate

# 验证特定配置
iter8 config validate --section roles

# 显示当前配置
iter8 config show

# 重置配置
iter8 config reset
```

## 🚑 紧急恢复

### 完全重置系统
```bash
# ⚠️ 警告：这将删除所有自定义配置
iter8 reset --all

# 保留用户数据的重置
iter8 reset --keep-data

# 只重置配置
iter8 reset --config-only
```

### 备份和恢复
```bash
# 创建备份
iter8 backup create

# 列出备份
iter8 backup list

# 恢复备份
iter8 backup restore backup-20250108-143022

# 自动备份设置
iter8 config set auto_backup true
```

## 📞 获取帮助

### 内置帮助系统
```bash
# 通用帮助
iter8 help

# 特定命令帮助
iter8 help role activate

# 交互式帮助
iter8 help --interactive

# 示例和教程
iter8 examples
```

### 社区支持
- **GitHub Issues**: 报告bug和功能请求
- **讨论论坛**: 社区问答和经验分享
- **文档Wiki**: 详细文档和最佳实践
- **视频教程**: 可视化学习资源

### 专业支持
- **技术支持邮箱**: support@iter8.dev
- **企业支持**: 提供专业的技术支持服务
- **培训服务**: 团队培训和最佳实践指导

## 🔧 高级故障排除

### 调试模式
```bash
# 启用调试模式
iter8 config set debug_mode true

# 详细输出
iter8 --verbose role activate po

# 跟踪执行
iter8 --trace workflow run product-documentation
```

### 网络问题诊断
```bash
# 网络连接测试
iter8 network test

# 代理设置
iter8 config set proxy http://proxy.company.com:8080

# DNS解析测试
iter8 network dns-test
```

### 权限问题解决
```bash
# 检查文件权限
iter8 permissions check

# 修复权限
iter8 permissions fix

# 以管理员身份运行
sudo iter8 install --system-wide
```

## 📊 问题报告

### 自动问题报告
当遇到错误时，系统会自动收集诊断信息：
- 错误堆栈跟踪
- 系统环境信息
- 相关配置文件
- 操作历史记录

### 手动问题报告
```bash
# 生成问题报告
iter8 report generate

# 包含敏感信息的报告
iter8 report generate --include-sensitive

# 发送报告
iter8 report send --id report-20250108-143022
```

## 🎯 预防措施

### 定期维护
```bash
# 每周执行
iter8 maintenance weekly

# 每月执行
iter8 maintenance monthly

# 自动维护
iter8 config set auto_maintenance true
```

### 监控和告警
```bash
# 设置监控
iter8 monitor setup

# 配置告警
iter8 alert configure --email your@email.com

# 查看监控状态
iter8 monitor status
```

### 最佳实践
1. **定期备份**: 每周备份配置和重要数据
2. **版本控制**: 将配置文件纳入版本控制
3. **测试环境**: 在测试环境中验证新配置
4. **文档更新**: 及时更新团队使用文档
5. **培训计划**: 定期培训团队成员
