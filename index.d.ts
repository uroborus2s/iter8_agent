#!/usr/bin/env node
/**
 * iter8 Augment Code MCP服务器
 * 为Augment Code提供iter8敏捷团队AI代理集成
 * 版本: 0.0.1
 * 创建日期: 2025-01-08
 * 更新日期: 2025-01-08
 *
 * 支持特性:
 * - MCP 1.0+ 协议兼容
 * - 动态工具注册
 * - 进度通知
 * - 图像上下文支持
 * - 流式HTTP支持
 * - OAuth认证集成
 */
declare class Iter8MCPServer {
    private server;
    private configPath;
    private templatesPath;
    private workflowsPath;
    private rolesPath;
    private roleDefinitionsPath;
    constructor();
    private setupToolHandlers;
    private activateRole;
    private parseTrigger;
    private loadRolePrompt;
    private loadRoleConfig;
    private loadRoleContext;
    private getSystemInfo;
    private getCollaborationSuggestions;
    private getAvailableActions;
    private startWorkflow;
    private listAvailableWorkflows;
    private generateTemplate;
    private getCurrentTimeInfo;
    private processTemplateVariables;
    private sanitizePersonName;
    private sanitizeTeamMembers;
    private removeAIRoleReferences;
    private formatArray;
    private generateFileName;
    private ensureDirectoryExists;
    private getProjectInfoTemplate;
    private getProjectContext;
    private facilitateCollaboration;
    private isTechStackRequest;
    private isDocumentCreationRequest;
    private handleArchitectTechStackRequest;
    private handleDocumentCreationRequest;
    private generateTechStackConsultationPrompt;
    private detectDocumentType;
    private generateInfoCollectionPrompt;
    private techStackConsultation;
    run(): Promise<void>;
    private generateTechStackOptions;
    private generateDecisionMatrix;
    private generateRiskAssessment;
    private generateImplementationRoadmap;
    private generateRecommendations;
    private getTechStackDatabase;
    private calculateTeamFitScore;
    private adjustComplexityForTeam;
    private scoreDevelopmentSpeed;
    private scoreScalability;
    private scoreMaintainability;
    private scoreTeamExpertise;
    private scoreCostEffectiveness;
    private generateMitigationStrategies;
    private declareThinkingMode;
    private getThinkingModeGuidance;
}
export { Iter8MCPServer };
