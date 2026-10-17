---
name: finishing-a-development-branch
description: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过展示合并、PR 或清理的结构化选项来指导开发工作的完成
---

# 完成开发分支

## 概述

通过展示清晰的选项并处理选定的工作流来指导开发工作的完成。

**核心原则：** 验证测试 → 检测环境 → 展示选项 → 执行选择 → 清理。

**开始时宣布：** "我正在使用 finishing-a-development-branch 技能来完成这项工作。"

## 流程

### 第 1 步：验证测试

**在展示选项之前，验证测试通过：**

```bash
# 运行项目的测试套件
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
测试失败（<N> 个失败）。必须在完成之前修复：

[显示失败]

测试通过前无法继续合并/PR。
```

停止。不要进入第 2 步。

**如果测试通过：** 继续第 2 步。

### 第 2 步：检测环境

**在展示选项之前确定工作空间状态：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这决定显示哪个菜单以及清理如何工作：

| 状态 | 菜单 | 清理 |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON`（普通仓库） | 标准 4 选项 | 无需清理工作树 |
| `GIT_DIR != GIT_COMMON`，命名分支 | 标准 4 选项 | 基于来源（见第 6 步） |
| `GIT_DIR != GIT_COMMON`，分离 HEAD | 缩减 3 选项（无合并） | 不清理（外部管理） |

### 第 3 步：确定基础分支

```bash
# 尝试常见的基础分支
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或询问："这个分支是从 main 分出来的——对吗？"

### 第 4 步：展示选项

**普通仓库和命名分支工作树——精确展示这 4 个选项：**

```
实现完成。你想做什么？

1. 本地合并回 <基础分支>
2. 推送并创建 Pull Request
3. 保持分支不变（我稍后处理）
4. 丢弃这项工作

哪个选项？
```

**分离 HEAD——精确展示这 3 个选项：**

```
实现完成。你处于分离 HEAD（外部管理的工作空间）。

1. 推送为新分支并创建 Pull Request
2. 保持现状（我稍后处理）
3. 丢弃这项工作

哪个选项？
```

**不要添加解释** - 保持选项简洁。

### 第 5 步：执行选择

#### 选项 1：本地合并

```bash
# 获取主仓库根目录以确保 CWD 安全
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先合并——在删除任何东西之前验证成功
git checkout <基础分支>
git pull
git merge <功能分支>

# 验证合并结果上的测试
<测试命令>

# 只有合并成功后：清理工作树（第 6 步），然后删除分支
```

然后：清理工作树（第 6 步），然后删除分支：

```bash
git branch -d <功能分支>
```

#### 选项 2：推送并创建 PR

```bash
# 推送分支
git push -u origin <功能分支>
```

**不要清理工作树**——用户需要它来迭代 PR 反馈。

#### 选项 3：保持现状

报告："保持分支 <名称>。工作树保留在 <路径>。"

**不要清理工作树。**

#### 选项 4：丢弃

**先确认：**
```
这将永久删除：
- 分支 <名称>
- 所有提交：<提交列表>
- 工作树位于 <路径>

输入 'discard' 确认。
```

等待确切确认。

如果确认：
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后：清理工作树（第 6 步），然后强制删除分支：
```bash
git branch -D <功能分支>
```

### 第 6 步：清理工作空间

**仅对选项 1 和 4 运行。** 选项 2 和 3 始终保留工作树。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`：** 普通仓库，无需清理工作树。完成。

**如果工作树路径在 `.worktrees/` 或 `worktrees/` 下：** Superpowers 创建了此工作树——我们负责清理。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # 自愈：清理任何过时的注册
```

**否则：** 宿主环境（harness）拥有此工作空间。不要移除它。如果你的平台提供工作空间退出工具，使用它。否则，保持工作空间不变。

## 快速参考

| 选项 | 合并 | 推送 | 保留工作树 | 清理分支 |
|--------|-------|------|---------------|----------------|
| 1. 本地合并 | 是 | - | - | 是 |
| 2. 创建 PR | - | 是 | 是 | - |
| 3. 保持现状 | - | - | 是 | - |
| 4. 丢弃 | - | - | - | 是（强制） |

## 常见错误

**跳过测试验证**
- **问题：** 合并损坏代码，创建失败的 PR
- **修复：** 在提供选项之前始终验证测试

**开放式问题**
- **问题：** "接下来我该做什么？" 是模糊的
- **修复：** 精确展示 4 个结构化选项（或分离 HEAD 时为 3 个）

**为选项 2 清理工作树**
- **问题：** 移除用户 PR 迭代所需的工作树
- **修复：** 仅对选项 1 和 4 进行清理

**在移除工作树之前删除分支**
- **问题：** `git branch -d` 失败，因为工作树仍然引用该分支
- **修复：** 先合并，移除工作树，然后删除分支

**从工作树内部运行 git worktree remove**
- **问题：** 当 CWD 在要移除的工作树内部时，命令静默失败
- **修复：** 在 `git worktree remove` 之前始终 `cd` 到主仓库根目录

**清理宿主拥有的工作树**
- **问题：** 移除宿主创建的工作树会导致幽灵状态
- **修复：** 只清理 `.worktrees/` 或 `worktrees/` 下的工作树

**丢弃无确认**
- **问题：** 意外删除工作
- **修复：** 要求键入 "discard" 确认

## 红旗

**绝不：**
- 在测试失败时继续
- 未验证结果上的测试就合并
- 未经确认就删除工作
- 未经明确请求就强制推送
- 在确认合并成功前移除工作树
- 清理非你创建的工作树（来源检查）
- 从工作树内部运行 `git worktree remove`

**始终：**
- 在提供选项前验证测试
- 在展示菜单前检测环境
- 精确展示 4 个选项（或分离 HEAD 时为 3 个）
- 为选项 4 获取键入确认
- 仅对选项 1 和 4 清理工作树
- 在工作树移除前 `cd` 到主仓库根目录
- 移除后运行 `git worktree prune`
