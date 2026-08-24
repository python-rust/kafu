# KAF Observatory

非公式花譜粉丝交互网站的前端工程原型。

## 开发环境

本项目使用 `mise` 隔离 Node.js、pnpm 和所有开发任务。不要把系统 Node/pnpm 当作项目运行环境，也不要把 `pnpm run ...` 作为日常入口。

```bash
mise run install
mise run dev
```

常用任务：

```bash
mise run dev
mise run env
mise run build
mise run test
mise run lint
mise run typecheck
mise run check
mise run e2e-install
mise run e2e
```

## Live2D 边界

当前首页使用项目自制的开发用 2D puppet，用于先验证角色常驻舞台、呼吸、眨眼、视线追踪、点击反馈、响应式和 reduced-motion 行为。

正式 Cubism 接入会遵循 `src/features/live2d/runtime/Live2DAdapter.ts` 的接口边界。这样后续替换为合法取得的 `.moc3` / `model3.json` 资产时，不需要让页面组件依赖 Cubism 内部对象。

## 版权说明

本仓库定位为非商业粉丝项目。当前开发 puppet 并非官方 Live2D 模型，也不包含从官方应用或页面提取的模型资源。
