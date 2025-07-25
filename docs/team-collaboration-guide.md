# 敏捷团队协作指南 - 封神演义版

## 🏮 **团队角色与协作优化总览**

### **设计理念**
基于封神演义中的经典角色，构建了一个具有中国文化特色的敏捷开发团队。每个角色都具有鲜明的个性特征和专业能力，通过神话故事的文化符号来强化角色认同和团队凝聚力。

## 🎭 **核心角色介绍**

### **业务价值层 (Business Value Layer)**

#### **姜尚 (姜子牙) - 产品负责人**
- **神话特质**: 战略规划大师，统筹全局
- **现代职责**: 产品策略制定、业务价值守护、史诗规划
- **协作伙伴**: 嫦娥 (UX专家)
- **唤醒方式**: `@po` 或 `@姜尚`
- **核心能力**: 
  - 产品战略制定 (`*create-prd`, `*create-epic`)
  - 业务价值验证 (`*validate business-value`)
  - 团队协作流程 (`*run workflow product-documentation`)

#### **嫦娥 - 用户体验专家**
- **神话特质**: 美感与体验女神，细致入微
- **现代职责**: 用户研究、体验设计、界面规范
- **协作伙伴**: 姜尚 (产品负责人)
- **唤醒方式**: `@ux-expert` 或 `@嫦娥`
- **核心能力**:
  - 用户研究洞察 (`*create user-research`)
  - 用户体验规格 (`*create ux-spec`)
  - 可用性验证 (`*validate ux-requirements`)

### **技术设计层 (Technical Design Layer)**

#### **鲁班 - 系统架构师**
- **神话特质**: 建筑设计大师，系统思维
- **现代职责**: 系统架构设计、技术选型、API设计
- **协作伙伴**: 文殊菩萨 (业务分析师)
- **唤醒方式**: `@architect` 或 `@鲁班`
- **核心能力**:
  - 系统架构设计 (`*run task create-doc --template architecture-tmpl`)
  - 技术选型评估
  - API和接口设计

#### **文殊菩萨 - 业务分析师**
- **神话特质**: 智慧分析之神，洞察本质
- **现代职责**: 需求分析、业务流程、系统调研
- **协作伙伴**: 鲁班 (系统架构师)
- **唤醒方式**: `@analyst` 或 `@文殊菩萨`
- **核心能力**:
  - 业务需求分析
  - 系统现状调研
  - 数据模型设计

### **实现层 (Implementation Layer)**

#### **哪吒 - 全栈开发工程师**
- **神话特质**: 多能力实现之神，技能全面
- **现代职责**: 代码实现、测试编写、技术集成
- **协作伙伴**: 杨戬 (质量保证工程师)
- **唤醒方式**: `@dev` 或 `@哪吒`
- **核心能力**:
  - 故事驱动开发 (`*run task implement-story`)
  - 代码质量保证 (`*validate`, `*run-tests`)
  - 技术债务管理

#### **杨戬 (二郎神) - 质量保证工程师**
- **神话特质**: 慧眼识珠，质量守护者
- **现代职责**: 质量检测、测试设计、缺陷追踪
- **协作伙伴**: 哪吒 (全栈开发工程师)
- **唤醒方式**: `@qa` 或 `@杨戬`
- **核心能力**:
  - 质量门控验证
  - 测试策略设计
  - 缺陷分析和追踪

### **流程协调层 (Process Coordination Layer)**

#### **太乙真人 - Scrum Master**
- **神话特质**: 流程指导大师，团队协调
- **现代职责**: 敏捷流程管理、障碍移除、持续改进
- **协作伙伴**: 元始天尊 (团队编排器)
- **唤醒方式**: `@sm` 或 `@太乙真人`
- **核心能力**:
  - 敏捷流程推进
  - 团队障碍移除
  - 持续改进引导

#### **元始天尊 - 团队编排器**
- **神话特质**: 至高统筹者，跨层协调
- **现代职责**: 团队统筹、工作流管理、资源协调
- **协作伙伴**: 全团队协调
- **唤醒方式**: `@orchestrator` 或 `@元始天尊`
- **核心能力**:
  - 工作流编排
  - 跨层协调
  - 决策支持

## 🤝 **协作模式与工作流程**

### **层内协作模式**

#### **业务价值层协作**
```
姜尚 + 嫦娥 → 产品文档协作流程
├── 需求收集 (姜尚主导)
├── 用户研究 (嫦娥主导)
├── PRD创建 (协作完成)
├── UX规格 (嫦娥主导，姜尚审核)
├── 史诗规划 (姜尚主导)
└── 用户故事 (协作完成)
```

**启动方式**: `*run workflow product-documentation`

#### **技术设计层协作**
```
鲁班 + 文殊菩萨 → 技术设计协作流程
├── 需求分析 (文殊菩萨主导)
├── 架构设计 (鲁班主导)
├── 技术选型 (协作评估)
└── 接口设计 (鲁班主导，文殊菩萨验证)
```

#### **实现层协作**
```
哪吒 + 杨戬 → 开发测试并行流程
├── 故事实现 (哪吒主导)
├── 测试用例 (杨戬设计)
├── 代码审查 (协作完成)
└── 质量验证 (杨戬主导)
```

### **跨层协作流程**

#### **业务到技术移交**
```
[姜尚 + 嫦娥] → [鲁班 + 文殊菩萨]
移交产物: PRD, UX规格, 业务约束, 用户需求
协作方式: 正式移交 + 澄清会议
```

#### **技术到实现移交**
```
[鲁班 + 文殊菩萨] → [哪吒 + 杨戬]
移交产物: 系统架构, 技术文档, 接口定义, 验收标准
协作方式: 技术交底 + 实现指导
```

## 🎯 **角色协作定义优化方案**

### **当前问题解决**
1. **避免角色定义冗余**: 不在每个角色中重复所有协作关系
2. **集中团队协作管理**: 使用统一的团队配置文件 `core-agile-team.yml`
3. **清晰的协作边界**: 在角色定义中只说明直接协作伙伴
4. **工作流驱动协作**: 通过workflow定义具体的协作流程

### **优化原则**

#### **1. 分层协作定义**
```yaml
# 在角色prompt中: 只定义直接协作关系
system_instructions:
  - 与[直接协作伙伴]协作完成[具体层面]工作

# 在团队配置中: 定义完整协作矩阵
collaboration_patterns:
  direct_collaborations: [同层协作]
  cross_layer_collaborations: [跨层协作]
```

#### **2. 决策权限清晰**
```yaml
decision_making:
  business_decisions: 姜尚(主决策) + 嫦娥(咨询)
  technical_decisions: 鲁班(主决策) + 文殊菩萨+哪吒(咨询)
  quality_decisions: 杨戬(主决策) + 鲁班+哪吒(咨询)
  process_decisions: 太乙真人(主决策) + 元始天尊(咨询)
```

#### **3. 冲突解决机制**
```
Level 1: 同层协作解决 (1-2天)
Level 2: 跨层升级到SM/Orchestrator (2-3天)
Level 3: 战略升级到外部决策者 (1周)
```

## 📋 **使用指南**

### **团队启动**
```bash
# 使用完整团队
*use team core-agile-team

# 使用业务价值子团队
*use team business-value-team

# 启动协作工作流
*run workflow product-documentation
```

### **角色协作示例**

#### **产品规划阶段**
```bash
# 1. 姜尚开始产品规划
@po *create-brief
@po *collaborate with ux

# 2. 嫦娥进行用户研究
@ux-expert *create user-research
@ux-expert *collaborate with po

# 3. 协作创建PRD
@po *run workflow product-documentation
```

#### **技术设计阶段**
```bash
# 1. 文殊菩萨分析需求
@analyst *analyze requirements

# 2. 鲁班设计架构
@architect *run task create-doc --template architecture-tmpl

# 3. 技术评审
@architect *collaborate with analyst
```

#### **开发实现阶段**
```bash
# 1. 哪吒实现故事
@dev *run task implement-story

# 2. 杨戬质量验证
@qa *validate story-quality

# 3. 协作解决问题
@dev *collaborate with qa
```

## 🌟 **团队文化建设**

### **神话角色认同**
- 通过封神演义的文化符号增强角色认同感
- 利用神话人物的特质指导现代工作方式
- 建立具有中国文化特色的团队文化

### **技能互补发展**
- **导师制**: 姜尚指导嫦娥业务理解，鲁班指导哪吒架构思维
- **知识分享**: 跨层知识传递，技能互补发展
- **持续改进**: 太乙真人引导全团队敏捷实践优化

### **成功指标**
- **协作效率**: 跨层移交效率、返工率、决策速度
- **交付质量**: 用户满意度、技术债务、缺陷密度
- **团队成长**: 技能发展、协作能力、团队凝聚力

---

**总结**: 通过封神演义角色化的敏捷团队设计，我们实现了文化特色与现代敏捷方法的完美结合，既保持了专业的协作效率，又增强了团队的文化认同感和凝聚力。每个角色都有明确的职责边界和协作关系，通过分层协作和工作流驱动，确保高效的团队协作。 