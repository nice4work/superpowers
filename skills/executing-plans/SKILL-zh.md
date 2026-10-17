---
name: executing-plans
description: 当你有书面实现计划需要在独立会话中执行并设有审查检查点时使用
---

# 执行计划

## 概述

加载计划，批判性审查，执行所有任务，完成后报告。

**开始时宣布：** "我正在使用 executing-plans 技能来实现这个计划。"

**注意：** 告诉你的用户 Superpowers 在有子代理访问权限时效果更好。如果在支持子代理的平台上运行（Claude Code、Codex CLI、Codex App、Copilot CLI 和 Gemini CLI 都符合条件；参见 `../using-superpowers/references/` 中各平台工具参考），其工作质量将显著提高。如果子代理可用，请使用 superpowers:subagent-driven-development 代替此技能。

## 流程

### 第 1 步：加载和审查计划
1. 阅读计划文件
2. 批判性审查 - 识别关于计划的任何问题或疑虑
3. 如果有疑虑：在开始前向你的用户提出
4. 如果没有疑虑：为计划项创建待办事项并继续

### 第 2 步：执行任务

对于每个任务：
1. 标记为 in_progress
2. 严格遵循每一步（计划有细粒度步骤）
3. 按照指定运行验证
4. 标记为 completed

### 第 3 步：完成开发

所有任务完成并验证后：
- 宣布："我正在使用 finishing-a-development-branch 技能来完成这项工作。"
- **必需的子技能：** 使用 superpowers:finishing-a-development-branch
- 遵循该技能来验证测试、展示选项、执行选择

## 何时停止并寻求帮助

**以下情况立即停止执行：**
- 遇到阻碍（缺少依赖、测试失败、指令不清晰）
- 计划有关键缺陷导致无法开始
- 你不理解某个指令
- 验证反复失败

**寻求澄清而不是猜测。**

## 何时重新审视前面的步骤

**以下情况返回审查（第 1 步）：**
- 用户根据你的反馈更新了计划
- 基本方法需要重新思考

**不要强行通过阻碍** - 停下来询问。

## 记住
- 首先批判性审查计划
- 严格遵循计划步骤
- 不要跳过验证
- 当计划要求时引用技能
- 遇到阻碍就停止，不要猜测
- 未经用户明确同意，绝不在 main/master 分支上开始实现

## 集成

**必需的工作流技能：**
- **superpowers:using-git-worktrees** - 确保隔离的工作空间（创建一个或验证现有的）
- **superpowers:writing-plans** - 创建此技能执行的计划
- **superpowers:finishing-a-development-branch** - 所有任务完成后完成开发
