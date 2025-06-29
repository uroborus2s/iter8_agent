# 文档分片任务 (Document Sharding Task)

## 任务目的

将大型文档基于二级标题(##)分割成多个较小的文档，创建有组织的文件夹结构，同时保持所有内容的完整性，包括代码块、图表和 Markdown 格式。

## 主要方法：自动化优先 (markdown-tree)

[[LLM: 首先，检查 .iter8/core-config.yml 中的 markdownExploder 是否设置为 true。如果是，尝试运行命令：`md-tree explode {输入文件} {输出路径}`。

如果命令成功执行，告知用户文档已成功分片并停止 - 不要继续进行后续步骤。

如果命令失败（特别是出现命令未找到或不可用的错误），告知用户："markdownExploder 设置已启用，但 md-tree 命令不可用。请执行以下操作之一：

1. 全局安装 @kayvan/markdown-tree-parser：`npm install -g @kayvan/markdown-tree-parser`
2. 或在 .iter8/core-config.yml 中将 markdownExploder 设置为 false

**重要：在执行上述操作之一之前，请停止这里 - 不要进行手动分片。**"

如果 markdownExploder 设置为 false，告知用户："markdownExploder 设置当前为 false。为了获得更好的性能和可靠性，建议您：

1. 在 .iter8/core-config.yml 中将 markdownExploder 设置为 true
2. 全局安装 @kayvan/markdown-tree-parser：`npm install -g @kayvan/markdown-tree-parser`

现在我将继续执行手动分片过程。"

仅当 markdownExploder 为 false 时，才继续下面的手动方法。]]

### 安装和使用

1. **全局安装**：

   ```bash
   npm install -g @kayvan/markdown-tree-parser
   ```

2. **使用 explode 命令**：

   ```bash
   # 针对 PRD 文档
   md-tree explode docs/prd.md docs/prd

   # 针对架构文档
   md-tree explode docs/architecture.md docs/architecture

   # 针对任意文档
   md-tree explode [源文档] [目标文件夹]
   ```

3. **工具功能**：
   - 自动按二级标题分割文档
   - 创建适当命名的文件
   - 正确调整标题级别
   - 处理代码块和特殊 Markdown 语法的所有边缘情况

如果用户已安装 @kayvan/markdown-tree-parser，使用该工具并跳过下面的手动过程。

---

## 手动方法 (如果 @kayvan/markdown-tree-parser 不可用或用户指定手动方法)

[[LLM: 仅当用户无法使用或不想使用 @kayvan/markdown-tree-parser 时，才执行下面的手动指令。]]

### 任务执行指令

### 1. 识别文档和目标位置

- 确定要分片的文档（用户提供的路径）
- 在 `docs/` 下创建与文档同名的新文件夹（不含扩展名）
- 示例：`docs/prd.md` → 创建文件夹 `docs/prd/`

### 2. 解析和提取章节

[[LLM: 在分片文档时：

1. 读取整个文档内容
2. 识别所有二级标题(## 标题)
3. 对于每个二级标题：
   - 提取该标题及其所有内容，直到下一个二级标题
   - 包含所有子章节、代码块、图表、列表、表格等
   - 特别注意：
     - 围栏代码块(```) - 确保捕获完整的代码块，包括结束的反引号，并考虑可能存在的误导性二级标题（实际上是围栏示例的一部分）
     - Mermaid 图表 - 保留完整的图表语法
     - 嵌套的 Markdown 元素
     - 可能在代码块内包含 ## 的多行内容

关键：使用理解 Markdown 上下文的正确解析。代码块内的 ## 不是章节标题。]]

### 3. 创建独立文件

对于每个提取的章节：

1. **生成文件名**：将章节标题转换为小写-短横线格式

   - 移除特殊字符
   - 用短横线替换空格
   - 示例："## 技术栈" → `tech-stack.md`

2. **调整标题级别**：

   - 二级标题在新分片文档中变为一级标题(# 而不是 ##)
   - 所有子章节级别减少 1：

   ```txt
     - ### → ##
     - #### → ###
     - ##### → ####
     - 等等
   ```

3. **写入内容**：将调整后的内容保存到新文件

### 4. 创建索引文件

在分片文件夹中创建 `index.md` 文件，包含：

1. 原始的一级标题和第一个二级标题之前的任何内容
2. 列出所有分片文件的链接：

```markdown
# 原始文档标题

[原始介绍内容（如有）]

## 章节

- [章节名称 1](./section-name-1.md)
- [章节名称 2](./section-name-2.md)
- [章节名称 3](./section-name-3.md)
  ...
```

### 5. 保护特殊内容

[[LLM: 特别注意保护：

1. **代码块**：必须捕获完整的代码块，包括：

   ```language
   内容
   ```

2. **Mermaid 图表**：保留完整语法：

   ```mermaid
   graph TD
   ...
   ```

3. **表格**：维护正确的 Markdown 表格格式

4. **列表**：保留缩进和嵌套

5. **内联代码**：保留反引号

6. **链接和引用**：保持所有 Markdown 链接完整

7. **模板标记**：如果文档包含 {{占位符}} 或 [[LLM 指令]]，请精确保留]]

### 6. 验证

分片完成后：

1. 验证所有章节都已提取
2. 检查没有内容丢失
3. 确保标题级别已正确调整
4. 确认所有文件已成功创建

### 7. 结果报告

提供摘要：

```text
文档分片成功完成：
- 源文档：[原始文档路径]
- 目标位置：docs/[文件夹名称]/
- 创建文件数：[数量]
- 章节：
  - section-name-1.md: "章节标题 1"
  - section-name-2.md: "章节标题 2"
  ...
```

## 重要注意事项

- 绝不修改实际内容，仅调整标题级别
- 保留所有格式，包括有意义的空白字符
- 处理边缘情况，如包含 ## 符号的代码块的章节
- 确保分片是可逆的（可以从分片重构原始文档）

## iter8 项目特定配置

- 配置文件位置：`.iter8/core-config.yml`
- 支持的文档类型：PRD、架构文档、技术规范等
- 输出目标：`docs/` 目录下的相应文件夹
- 与其他 iter8 任务的集成：支持后续的文档处理和代理访问

## 使用场景

- 将大型 PRD 分解为可管理的史诗章节
- 分割复杂的架构文档为专门的技术章节
- 为不同的 iter8 代理提供聚焦的文档片段
- 改善文档的可维护性和可读性