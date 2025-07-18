# 产品负责人 (PO) 主验证清单

本清单为产品负责人提供了一个全面的框架，用于在开发执行前验证项目计划。它会根据项目类型（绿地 vs 棕地）智能调整，并在适用时包含 UI/UX 的考量。

[[LLM: 初始化指令 - PO 主清单

项目类型检测：
首先，通过检查以下内容确定项目类型：

1. 这是一个绿地项目（从零开始的新项目）吗？
   - 寻找：新项目初始化、无现有代码库引用
   - 检查：prd.md、architecture.md、新项目设置故事

2. 这是一个棕地项目（增强现有系统）吗？
   - 寻找：对现有代码库的引用、增强/修改的语言
   - 检查：brownfield-prd.md、brownfield-architecture.md、现有系统分析

3. 项目是否包含 UI/UX 组件？
   - 检查：frontend-architecture.md、UI/UX 规范、设计文件
   - 寻找：前端故事、组件规范、用户界面提及

文档要求：
根据项目类型，确保你拥有以下文档的访问权限：

对于绿地项目：
- prd.md - 产品需求文档
- architecture.md - 系统架构
- frontend-architecture.md - 如果涉及 UI/UX
- 所有的史诗和故事定义

对于棕地项目：
- brownfield-prd.md - 棕地项目增强需求
- brownfield-architecture.md - 增强功能的架构
- 现有项目代码库的访问权限（关键 - 没有这个无法继续）
- 当前的部署配置和基础设施详情
- 数据库模式、API 文档、监控设置

跳过指令：
- 对于绿地项目，跳过标记为 [[仅限棕地项目]] 的部分
- 对于棕地项目，跳过标记为 [[仅限绿地项目]] 的部分
- 对于纯后端项目，跳过标记为 [[仅限 UI/UX]] 的部分
- 在最终报告中注明所有跳过的部分

验证方法：
1. 深入分析 - 根据文档彻底分析每个项目
2. 基于证据 - 验证时引用具体章节或代码
3. 批判性思维 - 质疑假设并识别差距
4. 风险评估 - 考虑每个决策可能出现的问题

执行模式：
询问用户希望如何进行清单审查：
- 逐节进行 (交互模式) - 审查每个部分，获得确认后再继续
- 一次性完成 (全面模式) - 完成全部分析并在最后提交报告]]

## 1. 项目设置与初始化

[[LLM: 项目设置是基础。对于绿地项目，确保从零开始。对于棕地项目，确保与现有系统安全集成。验证设置与项目类型匹配。]]

### 1.1 项目脚手架 [[仅限绿地项目]]
- [ ] 史诗 1 包含项目创建/初始化的明确步骤
- [ ] 如果使用入门模板，则包含克隆/设置的步骤
- [ ] 如果从零开始构建，则定义了所有必要的脚手架步骤
- [ ] 包括初始的 README 或文档设置
- [ ] 定义了仓库设置和初始提交流程

### 1.2 现有系统集成 [[仅限棕地项目]]
- [ ] 已完成并记录了现有项目分析
- [ ] 识别了与当前系统的集成点
- [ ] 开发环境保留了现有功能
- [ ] 验证了现有功能的本地测试方法
- [ ] 为每个集成点定义了回滚程序

### 1.3 开发环境
- [ ] 清晰定义了本地开发环境的设置
- [ ] 指定了所需的工具和版本
- [ ] 包括了安装依赖项的步骤
- [ ] 适当处理了配置文件
- [ ] 包括了开发服务器的设置

### 1.4 核心依赖
- [ ] 尽早安装了所有关键的包/库
- [ ] 妥善处理了包管理
- [ ] 适当定义了版本规范
- [ ] 指出了依赖冲突或特殊要求
- [ ] [[仅限棕地项目]] 验证了与现有技术栈的版本兼容性

## 2. 基础设施与部署

[[LLM: 基础设施必须在使用前建立。对于棕地项目，必须在不破坏现有基础设施的情况下进行集成。]]

### 2.1 数据库与数据存储设置
- [ ] 在任何操作之前进行数据库选择/设置
- [ ] 在数据操作之前创建模式定义
- [ ] 如果适用，定义了迁移策略
- [ ] 如果需要，包括了种子数据或初始数据设置
- [ ] [[仅限棕地项目]] 识别并缓解了数据库迁移风险
- [ ] [[仅限棕地项目]] 确保了向后兼容性

### 2.2 API 与服务配置
- [ ] 在实现端点之前设置 API 框架
- [ ] 在实现服务之前建立服务架构
- [ ] 在受保护路由之前设置认证框架
- [ ] 在使用之前创建中间件和通用工具
- [ ] [[仅限棕地项目]] 保持了与现有系统的 API 兼容性
- [ ] [[仅限棕地项目]] 保留了与现有认证的集成

### 2.3 部署流水线
- [ ] 在部署操作之前建立 CI/CD 流水线
- [ ] 在使用之前设置基础设施即代码 (IaC)
- [ ] 尽早定义了环境配置
- [ ] 在实现之前定义了部署策略
- [ ] [[仅限棕地项目]] 部署最大限度地减少了停机时间
- [ ] [[仅限棕地项目]] 实施了蓝绿部署或金丝雀部署

### 2.4 测试基础设施
- [ ] 在编写测试之前安装测试框架
- [ ] 在测试实现之前设置测试环境
- [ ] 在测试之前定义了模拟服务或数据
- [ ] [[仅限棕地项目]] 回归测试覆盖了现有功能
- [ ] [[仅限棕地项目]] 集成测试验证了新旧系统之间的连接

## 3. 外部依赖与集成

[[LLM: 外部依赖常常阻碍进度。对于棕地项目，确保新依赖不与现有依赖冲突。]]

### 3.1 第三方服务
- [ ] 确定了所需服务的账户创建步骤
- [ ] 定义了 API 密钥获取流程
- [ ] 包括了安全存储凭证的步骤
- [ ] 考虑了回退或离线开发选项
- [ ] [[仅限棕地项目]] 验证了与现有服务的兼容性
- [ ] [[仅限棕地项目]] 评估了对现有集成的影响

### 3.2 外部 API
- [ ] 清晰识别了与外部 API 的集成点
- [ ] 正确排序了与外部服务的认证流程
- [ ] 确认了 API 限制或约束
- [ ] 考虑了 API 失败的备用策略
- [ ] [[仅限棕地项目]] 维护了现有的 API 依赖

### 3.3 基础设施服务
- [ ] 正确排序了云资源配置
- [ ] 确定了 DNS 或域名注册需求
- [ ] 如果需要，包括了电子邮件或消息服务设置
- [ ] 在使用之前设置了 CDN 或静态资源托管
- [ ] [[仅限棕地项目]] 保留了现有的基础设施服务

## 4. UI/UX 考量 [[仅限 UI/UX]]

[[LLM: 仅当项目包含用户界面组件时才评估此部分。对于纯后端项目，完全跳过。]]

### 4.1 设计系统设置
- [ ] 尽早选择并安装了 UI 框架和库
- [ ] 建立了设计系统或组件库
- [ ] 定义了样式方法（如 CSS 模块、styled-components 等）
- [ ] 建立了响应式设计策略
- [ ] 预先定义了可访问性要求

### 4.2 前端基础设施
- [ ] 在开发前配置了前端构建流水线
- [ ] 定义了资源优化策略
- [ ] 设置了前端测试框架
- [ ] 建立了组件开发工作流
- [ ] [[仅限棕地项目]] 保持了与现有系统的 UI 一致性

### 4.3 用户体验流程
- [ ] 在实现前映射了用户旅程
- [ ] 尽早定义了导航模式
- [ ] 规划了错误状态和加载状态
- [ ] 建立了表单验证模式
- [ ] [[仅限棕地项目]] 保留或迁移了现有的用户工作流

## 5. 用户/代理职责

[[LLM: 清晰的所有权可以防止混淆。确保根据只有人类能完成的任务来恰当分配任务。]]

### 5.1 用户操作
- [ ] 用户职责仅限于只能由人类完成的任务
- [ ] 将在外部服务上创建账户的任务分配给用户
- [ ] 将采购或支付操作分配给用户
- [ ] 将提供凭证的任务恰当分配给用户

### 5.2 开发代理操作
- [ ] 将所有与代码相关的任务分配给开发代理
- [ ] 将自动化流程确定为代理的职责
- [ ] 恰当分配了配置管理
- [ ] 将测试和验证分配给适当的代理

## 6. 功能排序与依赖关系

[[LLM: 依赖关系构成了关键路径。对于棕地项目，确保新功能不会破坏现有功能。]]

### 6.1 功能依赖
- [ ] 正确排序了依赖于其他功能的功能
- [ ] 在使用共享组件之前构建它们
- [ ] 用户流程遵循逻辑进展
- [ ] 认证功能先于受保护的功能
- [ ] [[仅限棕地项目]] 在整个过程中保留了现有功能

### 6.2 技术依赖
- [ ] 在构建高层服务之前构建底层服务
- [ ] 在使用库和工具之前创建它们
- [ ] 在对数据模型进行操作之前定义它们
- [ ] 在客户端消费 API 端点之前定义它们
- [ ] [[仅限棕地项目]] 在每个步骤都测试了集成点

### 6.3 跨史诗依赖
- [ ] 后续史诗建立在早期史诗功能之上
- [ ] 没有史诗需要来自后续史诗的功能
- [ ] 一致地利用了早期史诗的基础设施
- [ ] 保持了增量价值交付
- [ ] [[仅限棕地项目]] 每个史诗都维护了系统完整性

## 7. 风险管理 [[仅限棕地项目]]

[[LLM: 此部分对于棕地项目至关重要。以悲观的角度思考什么可能会出问题。]]

### 7.1 破坏性变更风险
- [ ] 评估了破坏现有功能的风险
- [ ] 识别并缓解了数据库迁移风险
- [ ] 评估了 API 破坏性变更风险
- [ ] 识别了性能下降风险
- [ ] 评估了安全漏洞风险

### 7.2 回滚策略
- [ ] 为每个故事清晰定义了回滚程序
- [ ] 实施了功能标志策略
- [ ] 更新了备份和恢复程序
- [ ] 增强了对新组件的监控
- [ ] 定义了回滚触发器和阈值

### 7.3 用户影响缓解
- [ ] 分析了对现有用户工作流的影响
- [ ] 制定了用户沟通计划
- [ ] 更新了培训材料
- [ ] 支持文档是全面的
- [ ] 验证了用户数据的迁移路径

## 8. MVP 范围对齐

[[LLM: MVP 意味着最小可行产品。对于棕地项目，确保增强功能是真正必要的。]]

### 8.1 核心目标对齐
- [ ] 解决了 PRD 中的所有核心目标
- [ ] 功能直接支持 MVP 目标
- [ ] 没有超出 MVP 范围的无关功能
- [ ] 恰当确定了关键功能的优先级
- [ ] [[仅限棕地项目]] 证明了增强功能的复杂性是合理的

### 8.2 用户旅程完整性
- [ ] 完全实现了所有关键用户旅程
- [ ] 解决了边缘情况和错误场景
- [ ] 包括了用户体验考量
- [ ] [[仅限 UI/UX]] 纳入了可访问性要求
- [ ] [[仅限棕地项目]] 保留或改进了现有工作流

### 8.3 技术要求
- [ ] 解决了 PRD 中的所有技术约束
- [ ] 纳入了非功能性需求
- [ ] 架构决策与约束保持一致
- [ ] 解决了性能考量
- [ ] [[仅限棕地项目]] 满足了兼容性要求

## 9. 文档与交接

[[LLM: 良好的文档能够实现顺利的开发。对于棕地项目，集成点的文档至关重要。]]

### 9.1 开发者文档
- [ ] 在实现的同时创建 API 文档
- [ ] 设置说明是全面的
- [ ] 记录了架构决策
- [ ] 记录了模式和约定
- [ ] [[仅限棕地项目]] 详细记录了集成点

### 9.2 用户文档
- [ ] 如果需要，包括了用户指南或帮助文档
- [ ] 考虑了错误消息和用户反馈
- [ ] 完全指定了引导流程
- [ ] [[仅限棕地项目]] 记录了对现有功能的更改

### 9.3 知识转移
- [ ] [[仅限棕地项目]] 捕获了现有系统的知识
- [ ] [[仅限棕地项目]] 记录了集成知识
- [ ] 计划了代码审查的知识共享
- [ ] 将部署知识转移给运营团队
- [ ] 保留了历史背景

## 10. MVP 后续考量

[[LLM: 为成功做规划可以防止技术债务。对于棕地项目，确保增强功能不限制未来发展。]]

### 10.1 未来增强
- [ ] 清晰区分了 MVP 和未来功能
- [ ] 架构支持计划中的增强功能
- [ ] 记录了技术债务考量
- [ ] 确定了可扩展性点
- [ ] [[仅限棕地项目]] 集成模式是可重用的

### 10.2 监控与反馈
- [ ] 如果需要，包括了分析或使用情况跟踪
- [ ] 考虑了用户反馈收集
- [ ] 解决了监控和警报问题
- [ ] 纳入了性能测量
- [ ] [[仅限棕地项目]] 保留/增强了现有监控

## 验证摘要

[[LLM: 最终 PO 验证报告生成

生成一份根据项目类型调整的综合验证报告：

1.  执行摘要

    -   项目类型：[绿地/棕地] 带有 [UI/无 UI]
    -   整体准备情况（百分比）
    -   执行/不执行的建议
    -   关键阻塞性问题的数量
    -   因项目类型而跳过的部分

2.  项目特定分析

    对于绿地项目：

    -   设置的完整性
    -   依赖排序
    -   MVP 范围的适当性
    -   开发时间线的可行性

    对于棕地项目：

    -   集成风险水平（高/中/低）
    -   现有系统影响评估
    -   回滚准备情况
    -   用户中断的可能性

3.  风险评估

    -   按严重性排列的前 5 大风险
    -   缓解建议
    -   解决问题对时间线的影响
    -   [棕地] 具体集成风险

4.  MVP 完整性

    -   核心功能覆盖范围
    -   缺失的基本功能
    -   识别出的范围蔓延
    -   真正的 MVP vs 过度工程

5.  实施准备情况

    -   开发者清晰度得分 (1-10)
    -   模糊需求的数量
    -   缺失的技术细节
    -   [棕地] 集成点的清晰度

6.  建议

    -   开发前必须修复
    -   为保证质量应修复
    -   考虑改进
    -   推迟到 MVP 之后

7.  [仅限棕地项目] 集成信心
    -   在保留现有功能方面的信心
    -   回滚程序的完整性
    -   集成点的监控覆盖范围
    -   支持团队的准备情况

在提交报告后，询问用户是否需要：

-   对任何失败部分的详细分析
-   具体的任务重新排序建议
-   风险缓解策略
-   [棕地] 集成风险的深入探讨]]

### 分类状态

| 类别 | 状态 | 关键问题 |
| --- | --- | --- |
| 1. 项目设置与初始化 | _待定_ | |
| 2. 基础设施与部署 | _待定_ | |
| 3. 外部依赖与集成 | _待定_ | |
| 4. UI/UX 考量 | _待定_ | |
| 5. 用户/代理职责 | _待定_ | |
| 6. 功能排序与依赖关系 | _待定_ | |
| 7. 风险管理 (棕地) | _待定_ | |
| 8. MVP 范围对齐 | _待定_ | |
| 9. 文档与交接 | _待定_ | |
| 10. MVP 后续考量 | _待定_ | |

### 关键缺陷

（在验证期间填写）

### 建议

（在验证期间填写）

### 最终决定

- **已批准**：该计划是全面的、顺序合理的，并已准备好实施。
- **有条件批准**：该计划在继续之前需要进行特定的调整。
- **已拒绝**：该计划需要重大修订以解决关键缺陷。