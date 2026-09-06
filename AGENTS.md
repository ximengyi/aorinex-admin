# Repository Guidelines

> **Canonical AI instructions.** Codex、Cursor、Claude Code、Copilot 及其他 Agent 均以本文件为准。

## Related Backend Repository（必读）

本仓库为前端管理端 **aorinex-frontend**。配套后端固定在**同级目录** **aorinex-backend**。

| 角色 | 目录名 | 路径推导 |
|------|--------|----------|
| 前端（本仓） | `aorinex-frontend` | 当前项目根目录 |
| 后端 | `aorinex-backend` | 父目录 + `/aorinex-backend` |

示例：前端为 `/www/wwwroot/aorinex-frontend` 时，后端为 `/www/wwwroot/aorinex-backend`。

### 何时访问后端目录

需要查看或修改以下内容时，**直接读写** `aorinex-backend`，不要只在本仓猜测：

- API / Controller / Logic / Model / 中间件 / 路由
- 表结构、种子 SQL、`database/schema_init.sql`
- 权限码、菜单规则（`ax_rules`）、鉴权逻辑
- 前后端接口契约不一致时的联调排查

### 注意

- 后端是**独立 Git 仓库**；改后端代码时在 `aorinex-backend` 内提交/推送，勿混进本前端仓库。
- 本仓接口封装主要在 `apps/web-ele/src/api/`，须与后端路由对齐。
- Cursor 侧另有 `.cursor/rules/backend-sibling-repo.mdc`，与本约定一致；**其他 Agent 工具以本 `AGENTS.md` 为准。**

## Project Structure（摘要）

- 主应用：`apps/web-ele/`（Element Plus 管理端）
- 接口封装：`apps/web-ele/src/api/`
- 业务页面：`apps/web-ele/src/views/`
- 路由：`apps/web-ele/src/router/`
- 共享包：`packages/`
