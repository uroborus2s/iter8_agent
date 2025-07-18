# 模板格式约定 (Template Format Conventions)

BMAD 方法中的模板使用标准化的标记进行 AI 处理。这些约定确保了文档生成的一致性。

## 模板标记元素 (Template Markup Elements)

- **{{占位符}}**: 将被实际内容替换的变量。
- **[[LLM: 指令]]**: 供 AI 代理使用的内部处理指令（绝不向用户展示）。
- **REPEAT 部分**: 可根据需要重复的内容块。
- **^^CONDITION^^ 块**: 仅在满足条件时才包含的条件性内容。
- **@{示例}**: 用于指导的示例内容（绝不输出给用户）。

## 处理规则 (Processing Rules)

- 将所有 {{占位符}} 替换为项目特定的内容。
- 在内部执行所有 [[LLM: 指令]]，不向用户展示。
- 按规定处理条件性和重复性内容块。
- 使用示例进行指导，但绝不将其包含在最终输出中。
- 只向用户呈现干净、格式化的内容。

## 关键准则 (Critical Guidelines)

- **绝不向用户展示模板标记、LLM指令或示例**。
- 模板元素仅供 AI 处理使用。
- 专注于忠实地执行模板并输出干净的内容。
- 所有特定于模板的指令都嵌入在模板内部。
