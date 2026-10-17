---
name: requesting-code-review
description: 在完成任务、实现主要功能或合并之前使用，以验证工作是否符合需求
---

# 请求代码审查

调度一个代码审查子代理，在问题蔓延之前捕获它们。审查者获得精确构建的评估上下文——不是你会话的历史。这使审查者专注于工作产品而非你的思考过程，并为你继续工作保留自己的上下文。

**核心原则：** 尽早审查，经常审查。

## 何时请求审查

**强制性：**
- 子代理驱动开发中每个任务之后
- 完成主要功能之后
- 合并到 main 之前

**可选但有价值：**
- 卡住时（新视角）
- 重构之前（基线检查）
- 修复复杂错误之后

## 如何请求

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 调度代码审查子代理：**

调度一个 `general-purpose` 子代理，填写 [code-reviewer.md](code-reviewer.md) 中的模板

**占位符：**
- `{DESCRIPTION}` - 你构建了什么的简要概述
- `{PLAN_OR_REQUIREMENTS}` - 它应该做什么
- `{BASE_SHA}` - 起始提交
- `{HEAD_SHA}` - 结束提交

**3. 对反馈采取行动：**
- 立即修复关键（Critical）问题
- 在继续之前修复重要（Important）问题
- 记录次要（Minor）问题以备后续处理
- 如果审查者错了就反驳（附推理）

## 示例

```
[刚完成任务 2：添加验证函数]

你：让我在继续之前请求代码审查。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[调度代码审查子代理]
  DESCRIPTION: 添加了 verifyIndex() 和 repairIndex()，支持 4 种问题类型
  PLAN_OR_REQUIREMENTS: docs/superpowers/plans/deployment-plan.md 中的任务 2
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[子代理返回]:
  优点：架构清晰，测试真实
  问题：
    重要：缺少进度指示器
    次要：报告间隔的魔术数字（100）
  评估：可以继续

你：[修复进度指示器]
[继续任务 3]
```

## 与工作流集成

**子代理驱动开发：**
- 每个任务之后审查
- 在问题复合之前捕获
- 在移动到下一个任务之前修复

**执行计划：**
- 每个任务后或在自然检查点审查
- 获取反馈，应用，继续

**临时开发：**
- 合并前审查
- 卡住时审查

## 红旗

**绝不：**
- 因为 "很简单" 而跳过审查
- 忽略关键（Critical）问题
- 在未修复重要（Important）问题的情况下继续
- 与有效的技术反馈争论

**如果审查者错了：**
- 用技术推理反驳
- 展示证明它工作的代码/测试
- 请求澄清

参见模板：[code-reviewer.md](code-reviewer.md)
