# AI Interview Assistant

一个面向求职者的 AI 模拟面试应用。上传 PDF 简历后，应用会提炼候选人的经历与能力画像，生成针对性问题，支持逐题作答、AI 评分，并在登录后保存面试报告以便复盘。

## 核心能力

- **简历解析**：读取 PDF 文本，提炼工作经历、技术栈、项目经验、优势、不足与推荐岗位。
- **针对性出题**：基于简历分析生成 10 道个性化面试题，而不是使用固定题库。
- **模拟面试与评分**：逐题记录回答，AI 为每题输出分数、亮点、待改进项和可执行建议，并计算综合得分。
- **报告沉淀**：登录用户的面试报告保存至 Supabase，可从仪表盘查看最近记录和报告详情。
- **访客模式**：无需注册即可体验完整流程；访客数据仅保留在当前页面内，刷新后不会保留。
- **用户隔离**：登录后的分析缓存按用户隔离，避免不同账号之间混用数据。

## 使用流程

```text
上传 PDF 简历
      ↓
AI 提炼候选人画像
      ↓
生成 10 道定制化问题
      ↓
逐题模拟作答
      ↓
AI 评分并生成复盘报告
      ↓
登录用户保存并查看历史报告
```

## 所含知识内容

本项目围绕求职面试准备，设计了以下核心知识内容：

- 简历解读与能力提炼：自动识别工作经历、项目成果、技术栈、岗位匹配点、个人优势与提升空间。
- 面试题目类型：涵盖技术问答、项目经验、行为面试、问题解决、团队协作和职业规划等常见维度。
- 回答评分标准：基于答案完整性、条理性、专业度、示例支撑与面向岗位的契合度给出评分。
- 反馈建议：提供亮点提取、关键补充点、可改进方式和后续复盘方向，帮助用户优化表达与简历内容。
- 报告复盘能力：保存面试结果与评分，支持多次训练后的历史对比与自我复盘分析。

这些内容可以帮助用户从简历、出题、作答到评分复盘，形成闭环的面试准备知识体系。

## 技术方案

| 领域 | 方案 | 用途 |
| --- | --- | --- |
| Web 框架 | Next.js 16 + React 19 + TypeScript | App Router 页面与服务端 API |
| 样式 | Tailwind CSS 4 | 响应式界面与深色模式 |
| AI | OpenAI SDK | 结构化简历分析、出题与评分 |
| 模型提供方 | OpenRouter 或 OpenAI | 通过兼容 Chat Completions API 调用模型 |
| 认证与数据 | Supabase Auth + Postgres | 邮箱注册登录与面试报告持久化 |
| PDF | pdf-parse | 从上传简历中提取文本 |

项目将 AI 请求放在服务端 Route Handler 中，避免暴露模型密钥；浏览器只调用站内 `/api` 接口。可通过 `HTTPS_PROXY` 或 `HTTP_PROXY` 为 AI 与 Supabase 的服务端请求配置代理。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件并填写真实值：

```bash
Copy-Item .env.example .env.local
```

`.env.local` 示例：

```env
# 任选一种 AI 提供方
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=deepseek/deepseek-chat

# 或：直接使用 OpenAI
# OPENAI_API_KEY=your_openai_api_key
# OPENAI_MODEL=gpt-4o-mini

# 可选：网络需要代理时启用
# HTTPS_PROXY=http://127.0.0.1:7897

# Supabase 项目设置 → API / Connect 页面获取
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

> `SUPABASE_SECRET_KEY` 仅供服务器使用，绝不能使用 `NEXT_PUBLIC_` 前缀、提交到仓库或写入客户端代码。

### 3. 创建报告数据表

在 Supabase SQL Editor 执行以下语句。应用使用服务端密钥按已认证用户 ID 读写数据；仍建议启用 RLS 作为数据库默认安全边界。

```sql
create table if not exists public.interview_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists interview_reports_user_created_at_idx
  on public.interview_reports (user_id, created_at desc);

alter table public.interview_reports enable row level security;
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。首次注册是否需要邮件确认，取决于 Supabase Auth 中的邮箱确认设置。

## 常用命令

```bash
npm run dev      # 启动开发环境
npm run lint     # 运行 ESLint
npm run build    # 创建生产构建
npm run start    # 启动生产服务器（需先 build）
```

## 项目结构

```text
src/
├── app/
│   ├── (protected)/       # 仪表盘、简历分析和模拟面试页面
│   └── api/               # 简历、出题、评分、认证与报告接口
├── components/            # 页面功能组件与认证守卫
└── lib/
    ├── ai/                # AI 客户端、提示词和任务步骤
    ├── auth/              # 访客模式
    ├── cache/             # 分用户的浏览器端流程缓存
    ├── report/            # 报告组装与生成
    └── database.ts        # Supabase 报告读写
```

## API 概览

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/analyze/resume` | `POST` | 接收 PDF 文件并返回简历分析结果 |
| `/api/analyze/questions` | `POST` | 根据简历分析生成面试问题 |
| `/api/analyze/score` | `POST` | 批量评分面试回答并返回平均分 |
| `/api/auth/signup` | `POST` | 邮箱注册 |
| `/api/auth/signin` | `POST` | 邮箱密码登录 |
| `/api/reports` | `GET` / `POST` | 获取或保存当前用户的面试报告 |

## 数据与安全说明

- 上传的 PDF 用于本次服务器端文本提取和 AI 分析；项目不会将原始 PDF 写入 Supabase。
- 登录用户的报告以 JSON 形式保存到 `interview_reports`；访客报告不保存到数据库。
- 浏览器缓存仅保存登录用户的分析与作答进度，方便中断后继续；访客模式不写入本地持久化缓存。
- 使用前请评估所选 AI 提供方的数据处理政策，避免在简历中包含不必要的敏感信息。

## 排障

| 现象 | 优先检查项 |
| --- | --- |
| 简历分析或出题失败 | 是否设置了 `OPENROUTER_API_KEY` 或 `OPENAI_API_KEY`，模型名称与网络代理是否可用 |
| 登录出现 `fetch failed` / `ECONNRESET` | `NEXT_PUBLIC_SUPABASE_URL` 是否为当前项目地址、项目是否存在、代理是否运行 |
| 登录后无法保存报告 | Supabase 三个变量、`interview_reports` 表和数据库权限是否已配置 |
| 修改 `.env.local` 后不生效 | 停止并重新运行 `npm run dev`，让 Next.js 重新加载环境变量 |

## 后续改进方向

- 增加目标岗位、JD 和面试语言等上下文，使出题更贴合真实岗位。
- 为报告添加时间维度与能力项趋势，展示多次训练的进步。
- 增加题目追问、语音回答和多轮对话面试能力。
- 补齐端到端测试与结构化数据库迁移。
