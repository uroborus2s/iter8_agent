# 工作流执行问题修复方案

## 🔍 问题分析

### 1. 当前问题
- **工作流执行不完整**: 只执行了第一步（PRD创建），没有完成完整的工作流序列
- **信息收集缺失**: 没有在文档生成前收集真实的项目信息
- **模板变量错误**: 使用了AI角色名称而非真实团队成员
- **日期错误**: 使用了硬编码的2024年12月而非当前日期

### 2. 根本原因
- MCP服务器的`startWorkflow`函数只返回了工作流信息，没有实际执行步骤
- 缺少交互式信息收集机制
- 模板变量替换逻辑不完善

## 🛠️ 修复方案

### 方案1: 改进工作流执行逻辑

```typescript
private async startWorkflow(args: any) {
  const { workflow_id, inputs = {} } = args;
  
  try {
    // 1. 加载工作流定义
    const workflowPath = path.join(process.cwd(), this.workflowsPath, `${workflow_id}.yml`);
    const workflowContent = await fs.readFile(workflowPath, "utf8");
    const workflow = yaml.load(workflowContent) as any;
    
    // 2. 检查是否需要信息收集
    if (workflow_id === 'product-documentation') {
      return await this.executeProductDocumentationWorkflow(workflow, inputs);
    }
    
    // 3. 通用工作流执行
    return await this.executeGenericWorkflow(workflow, inputs);
    
  } catch (error) {
    return this.createErrorResponse(`工作流执行失败: ${error.message}`);
  }
}

private async executeProductDocumentationWorkflow(workflow: any, inputs: any) {
  // 1. 首先收集项目信息
  const projectInfo = await this.collectProjectInformation();
  
  // 2. 执行工作流步骤
  const results = [];
  const sequence = workflow.workflow?.sequence || [];
  
  for (const step of sequence) {
    const stepResult = await this.executeWorkflowStep(step, projectInfo, results);
    results.push(stepResult);
    
    // 如果步骤失败，停止执行
    if (!stepResult.success) {
      break;
    }
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        workflow_completed: true,
        workflow_id: 'product-documentation',
        steps_executed: results.length,
        results: results,
        message: "产品文档工作流执行完成"
      }, null, 2)
    }]
  };
}
```

### 方案2: 实现交互式信息收集

```typescript
private async collectProjectInformation() {
  return {
    content: [{
      type: "text", 
      text: `
# 📋 项目信息收集

在创建产品需求文档之前，请提供以下信息：

## 基本项目信息
1. **项目名称**: 
2. **项目简介**: 
3. **项目负责人**: 
4. **团队成员**: 
5. **预期完成时间**: 

## 业务信息
1. **目标用户**: 
2. **主要功能**: 
3. **业务目标**: 
4. **成功指标**: 

请提供上述信息，我将基于这些信息创建完整的产品文档。

**下一步**: 收到信息后，我将：
1. 创建项目简介 (project-brief.md)
2. 进行用户研究分析 (user-research-insights.md) 
3. 创建产品需求文档 (prd.md)
4. 制定用户体验规格 (ux-specification.md)
5. 规划史诗和用户故事
6. 完成业务验证

请提供项目信息以继续工作流。
`
    }]
  };
}
```

### 方案3: 改进模板变量替换

```typescript
private replaceTemplateVariables(template: string, projectInfo: any): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const variables = {
    '{{项目名称}}': projectInfo.projectName || '未指定项目',
    '{{项目代号}}': projectInfo.projectCode || projectInfo.projectName || 'PROJECT',
    '{{创建日期}}': currentDate,
    '{{团队成员}}': projectInfo.teamMembers || '待确定',
    '{{项目负责人}}': projectInfo.projectManager || '待确定',
    '{{产品愿景声明}}': projectInfo.vision || '待定义',
    '{{产品如何在市场中定位}}': projectInfo.positioning || '待分析'
  };
  
  let result = template;
  for (const [placeholder, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  return result;
}
```

## 🎯 立即修复建议

### 临时解决方案
由于当前MCP服务器代码修改较复杂，建议采用以下临时方案：

1. **分步执行工作流**:
```bash
# 第1步：收集项目信息
@姜尚 请先收集项目基本信息，包括项目名称、团队成员、业务目标等

# 第2步：创建项目简介
@姜尚 基于收集的信息创建项目简介文档

# 第3步：用户研究
@嫦娥 基于项目简介进行用户研究分析

# 第4步：创建PRD
@姜尚 基于项目简介和用户研究创建产品需求文档

# 第5步：UX规格
@嫦娥 基于PRD创建用户体验规格说明

# 第6步：史诗规划
@姜尚 基于PRD和UX规格进行史诗规划和用户故事创建
```

2. **使用正确的模板变量**:
在每次文档创建时，明确指定：
- 使用当前日期而非硬编码日期
- 使用真实团队成员姓名
- 基于用户提供的项目信息填充模板

### 长期解决方案
需要修改MCP服务器代码，实现：
1. 完整的工作流状态管理
2. 交互式信息收集机制  
3. 智能模板变量替换
4. 工作流步骤链式执行

## 📋 使用建议

### 正确的工作流启动方式
```bash
# 不要直接使用：
# "启动iter8敏捷团队的产品文档工作流(product-documentation)"

# 而是使用：
@姜尚 我需要为新项目创建完整的产品文档，请先帮我收集项目基本信息，然后按照产品文档工作流的步骤逐步完成所有文档的创建

# 或者：
@元始天尊 请协调团队完成产品文档工作流，确保收集真实项目信息并创建完整的文档集合
```

这样可以确保：
1. ✅ 收集真实项目信息
2. ✅ 使用正确的日期和团队成员
3. ✅ 完成完整的工作流步骤
4. ✅ 创建高质量的文档集合
