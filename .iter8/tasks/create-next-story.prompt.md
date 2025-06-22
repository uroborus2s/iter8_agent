### 创建下一个用户故事任务  

#### 一、任务目的  
基于项目进度和史诗（Epic）定义，识别下一个逻辑上应推进的用户故事，并使用`故事模板`准备一份完整、独立且可执行的故事文件。该任务确保故事包含所有必要的技术背景、需求和验收标准，使开发代理（Developer Agent）无需额外调研即可高效实现。  


#### 二、任务执行说明  

### 0. 加载核心配置  
[[LLM：关键 - 此为必须第一步]]  
- 从项目根目录加载`.iter8_core/core-config.yml`文件  
- 若文件不存在：  
  - 暂停并告知用户："未找到core-config.yml文件，此文件为创建故事必需。可执行以下操作：  
    1. 从GITHUB uroborus2s/iter8_agent/core-config.yml复制并为项目配置  
    2. 对项目运行iter8安装程序以自动升级并添加此文件  
    请先添加并配置core-config.yml再继续。"  
- 提取以下关键配置：  
  - `projectMode`: 项目模式 ('single' 或 'monorepo')，默认为 'single'。  
  - **若`projectMode: 'monorepo'`**，则还需：  
    - `activeProject`: 当前激活的子项目名称。  
    - `projects`: 包含所有子项目配置的列表。  
    - [[LLM：代理需要基于 `activeProject` 从 `projects` 列表中查找对应的项目配置，并使用其路径设置。]]  
    - 示例 `core-config.yml` (monorepo):  
      ```yaml  
      projectMode: monorepo  
      activeProject: feature-A  
      projects:  
        feature-A:  
          root: apps/feature-A  
          devStoryLocation: docs/stories  
          prdShardedLocation: docs/epics  
          architectureShardedLocation: docs/architecture  
        feature-B:  
          ...  
      ```  
  - **若`projectMode: 'single'`**，则直接使用顶层路径配置。  
    - 示例 `core-config.yml` (single):  
      ```yaml  
      projectMode: single  
      devStoryLocation: docs/stories  
      ...  
      ```  
- 解析并确定以下将在此任务中使用的最终路径变量：  
  - `devStoryLocation`：故事文件保存路径  
  - `prd.prdSharded`：PRD（产品需求文档）是否为分片模式  
  - `prd.prdFile`：整体式PRD的位置（非分片时）  
  - `prd.prdShardedLocation`：分片史诗文件的位置  
  - `prd.epicFilePattern`：史诗文件命名模式（如`epic-{n}*.md`）  
  - `architecture.architectureVersion`：架构文档版本  
  - `architecture.architectureSharded`：架构是否分片  
  - `architecture.architectureFile`：整体式架构文档位置  
  - `architecture.architectureShardedLocation`：分片架构文件位置  
- [[LLM：在 Monorepo 模式下，所有路径（如 `devStoryLocation`）都应相对于子项目的根目录（如 `apps/feature-A/`）进行拼接。]]  


### 1. 识别待准备的下一个故事  
#### 1.1 定位史诗文件  
- 根据配置中的`prdSharded`：  
  - **若`prdSharded: true`**：使用`epicFilePattern`在`prdShardedLocation`中查找史诗文件  
  - **若`prdSharded: false`**：从`prdFile`加载完整PRD，并从章节标题（## Epic N或### Epic N）中提取史诗  


#### 1.2 审查现有故事  
- 检查配置中的`devStoryLocation`（如`docs/stories/`）中的现有故事文件  
- 若目录存在且至少有1个文件，找到编号最大的故事文件：  
  - **若存在最大编号故事文件（`{lastEpicNum}.{lastStoryNum}.story.md`）**：  
    - 验证其`Status`为'Done'（或等效状态）。  
    - 若状态非'Done'，向用户发出警告：    
    ```plaintext
    警告：发现未完成的故事：  
    文件：{lastEpicNum}.{lastStoryNum}.story.md  
    状态：[当前状态]  

    请选择操作：  
    1. 查看未完成故事详情（指导用户操作，代理不显示）  
    2. 暂时取消创建新故事  
    3. 接受风险&覆盖以创建下一个草稿故事  

    请选择选项（1/2/3）：
    ```  
    - 仅当用户选择选项3（覆盖）或最后一个故事为'Done'时继续。  
    - 若继续：查找`{lastEpicNum}`对应的史诗文件（如`epic-{lastEpicNum}*.md`），解析该史诗中的所有故事，**必须选择下一个顺序故事**（如最后一个为2.2，下一个必须为2.3）。  
    - 若下一个顺序故事存在未满足的前提条件，向用户展示：    
    ```plaintext
    警告：下一个故事存在未满足的前提条件：  
    故事：{epicNum}.{storyNum} - {故事标题}  
    未满足的前提条件：[具体前提条件列表]  

    请选择操作：  
    1. 仍创建故事（标记前提条件为待处理）  
    2. 跳过至其他故事（需用户具体指示）  
    3. 取消故事创建  

    请选择选项（1/2/3）：
    ```  
    - 若当前史诗中无更多故事（如2.9已完成且无2.10）：    
    ```plaintext
    史诗{epicNum}已完成：史诗{epicNum}中的所有故事均已完成。  

    请选择操作：  
    1. 开始史诗{epicNum + 1}的故事{epicNum + 1}.1  
    2. 选择特定故事进行处理  
    3. 取消故事创建  

    请选择选项（1/2/3）：
    ```  
    - **关键**：禁止自动跳过至其他史诗或非顺序故事。若需跳过顺序，用户必须明确指示创建哪个故事。  
  - **若`docs/stories/`中无故事文件**：  
    - 下一个故事始终为1.1（第一个史诗的第一个故事）。  
    - 若故事1.1存在未满足的前提条件，按上述警告流程处理。  
- 向用户告知已识别的故事："已识别待准备的下一个故事：{epicNum}.{storyNum} - {故事标题}"。  


### 2. 收集核心故事需求（来自史诗）  
- 对已识别的故事，审查其父史诗（如从1.1步骤中定位的`epic-{epicNum}*.md`）。  
- 提取：准确标题、完整目标/用户故事描述、初始需求列表、所有验收标准（ACs）及任何预定义的高级任务。  
- 记录此原始史诗定义的范围，用于后续偏差分析。  


### 3. 审查前一个故事并提取开发笔记  
[[LLM：此步骤对保持连续性和从实施经验中学习至关重要]]  
- 若不是第一个故事（即存在前一个故事）：  
  - 从`docs/stories`读取前一个顺序故事  
  - 特别注意：  
    - 开发代理记录部分（尤其是完成笔记和调试日志引用）  
    - 与计划实施的任何偏差  
    - 实施过程中做出的技术决策  
    - 遇到的挑战及解决方案  
    - 任何"经验教训"或对未来故事的笔记  
  - 提取可能影响当前故事准备的相关见解  


### 4. 收集并综合架构上下文  
[[LLM：关键 - 必须从架构文档中收集技术细节，绝不可编造文档中未提及的技术细节。]]  
#### 4.1 确定架构文档策略  
基于步骤0中加载的配置：  
- **若`architectureVersion: v1`且`architectureSharded: true`**：  
  - 读取`{architectureShardedLocation}/index.md`以了解可用文档  
  - 按4.2节的结构化阅读顺序执行  
- **若`architectureVersion: v1`且`architectureSharded: false`**：  
  - 从`architectureFile`加载整体式架构  
  - 基于v4结构提取相关章节（技术栈、项目结构等）  
- **若`architectureVersion`非v1**：  
  - 告知用户："架构文档非v1格式，将基于最佳判断查找相关信息。"  
  - 若`architectureSharded: true`：按文件名相关性搜索分片文件  
  - 若`architectureSharded: false`：在整体式`architectureFile`中搜索相关章节  


#### 4.2 基于故事类型的推荐阅读顺序（仅适用于v1分片架构）  
[[LLM：此结构化方法仅适用于v1分片架构，其他版本基于文件名和内容进行最佳判断。]]  
**适用于所有故事：**  
1. `docs/architecture/tech-stack.md` - 了解技术约束和版本  
2. `docs/architecture/unified-project-structure.md` - 明确代码放置位置  
3. `docs/architecture/coding-standards.md` - 确保开发遵循项目规范  
4. `docs/architecture/testing-strategy.md` - 在任务中包含测试需求  

**对于后端/API故事，额外阅读：**  
5. `docs/architecture/data-models.md` - 数据结构和验证规则  
6. `docs/architecture/database-schema.md` - 数据库设计和关系  
7. `docs/architecture/backend-architecture.md` - 服务模式和结构  
8. `docs/architecture/rest-api-spec.md` - API端点规范  
9. `docs/architecture/external-apis.md` - 第三方集成（若相关）  

**对于前端/UI故事，额外阅读：**  
5. `docs/architecture/frontend-architecture.md` - 组件结构和模式  
6. `docs/architecture/components.md` - 特定组件设计  
7. `docs/architecture/core-workflows.md` - 用户交互流程  
8. `docs/architecture/data-models.md` - 前端数据处理  

**对于全栈故事：**  
- 阅读上述后端和前端部分  


#### 4.3 提取故事特定的技术细节  
[[LLM：阅读每个文档时，仅提取与实现当前故事直接相关的信息。除非直接影响故事实现，否则不包含通用信息。]]  
对每个相关文档，提取：  
- 故事将使用的特定数据模型、模式或结构  
- 故事必须实现或消费的API端点  
- 故事中UI元素的组件规范  
- 新代码的文件路径和命名约定  
- 故事功能特有的测试需求  
- 影响故事的安全或性能注意事项  


#### 4.4 记录来源引用  
[[LLM：必须为包含的每个技术细节引用源文档和章节，以便开发代理在需要时验证信息。]]  
引用格式为：`[来源：architecture/{文件名}.md#{章节}]`  


### 5. 验证项目结构一致性  
- 将故事需求和预期的文件操作与`docs/architecture/unified-project-structure.md`中的项目结构指南交叉对照。  
- 确保故事隐含的任何文件路径、组件位置或模块名称与定义的结构一致。  
- 在故事草稿的"项目结构笔记"部分记录任何结构冲突、必要澄清或未定义的组件/路径。  


### 6. 用完整上下文填充故事模板  
- 创建新故事文件：`{devStoryLocation}/{epicNum}.{storyNum}.story.md`（使用配置中的位置）。  
- 使用故事模板构建文件结构，填充内容：  
  - 故事`{EpicNum}.{StoryNum}: {从史诗文件复制的短标题}`  
  - `状态：草稿`  
  - `故事`（来自史诗的用户故事描述）  
  - `验收标准（ACs）`（来自史诗，可根据上下文需要细化）  
- **`开发技术指导`部分（关键）：**    
  [[LLM：此部分必须仅包含从架构分片中提取的信息，绝不可虚构或假设技术细节。]]  
  - 按类别包含从步骤3和4中收集的所有相关技术细节：    
    - **前一个故事见解**：从前一个故事中获得的关键经验或注意事项  
    - **数据模型**：特定模式、验证规则、关系[含来源引用]  
    - **API规范**：端点细节、请求/响应格式、认证要求[含来源引用]  
    - **组件规范**：UI组件细节、属性、状态管理[含来源引用]  
    - **文件位置**：基于项目结构应创建新代码的准确路径  
    - **测试需求**：来自testing-strategy.md的特定测试用例或策略  
    - **技术约束**：版本要求、性能考虑、安全规则  
  - 每个技术细节必须包含来源引用：`[来源：architecture/{文件名}.md#{章节}]`  
  - 若某类别在架构文档中未找到信息，明确说明："架构文档中未找到具体指导"  

- **`任务/子任务`部分：**  
  - 仅基于以下内容生成详细的顺序技术任务：    
    - 来自史诗的需求  
    - 来自架构分片的技术约束  
    - 统一项目结构中的项目结构  
    - 测试策略中的测试需求  
  - 每个任务必须引用相关架构文档  
  - 基于测试策略将单元测试作为显式子任务包含  
  - 在适用时将任务与AC关联（如`任务1（AC：1, 3）`）  
- 添加步骤5中发现的项目结构一致性或差异笔记。  
- 基于史诗需求与架构约束的任何冲突，准备"偏差分析"内容。  


### 7. 运行故事草稿检查清单  
- 对准备好的故事执行《故事草稿检查清单》  
- 记录发现的任何问题或缺口  
- 进行必要调整以满足质量标准  
- 确保所有技术指导均正确源自架构文档  


### 8. 完成故事文件  
- 审查所有部分的完整性和准确性  
- 验证技术细节均包含来源引用  
- 确保任务与史诗需求和架构约束一致  
- 更新状态为"草稿"  
- 将故事文件保存至`{devStoryLocation}/{epicNum}.{storyNum}.story.md`（使用配置中的位置）  


### 9. 报告完成情况  
向用户提供摘要，包括：  
- 已创建的故事：`{epicNum}.{storyNum} - {故事标题}`  
- 状态：草稿  
- 从架构文档中包含的关键技术组件  
- 史诗与架构之间注意到的任何偏差或冲突  
- 审批前故事审查的建议  
- 下一步：故事在开发工作开始前应经产品负责人（PO）审查批准  

[[LLM：请记住 - 此任务的成功取决于从架构分片中提取真实、具体的技术细节。开发代理应在故事文件中获得所需的所有信息，无需搜索多个文档。]]