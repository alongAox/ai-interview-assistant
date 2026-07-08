# AI Interview Assistant

AI 驱动的智能面试助手，基于 Next.js 构建。支持模拟真实面试场景，并提供即时反馈与改进建议。

## 技术栈

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首页
│   ├── interview/      # 模拟面试页面
│   └── globals.css     # 全局样式
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |

## 后续开发

- [ ] 接入 AI API（OpenAI / Anthropic 等）
- [ ] 实现面试对话界面
- [ ] 添加简历上传与岗位匹配
- [ ] 生成面试反馈报告
