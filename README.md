# KAF Observatory

非公式花譜粉丝交互网站的前端工程原型。

## 在线站点

GitHub Pages：

```text
https://python-rust.github.io/kafu/
```

页面的图片、字体、JavaScript 和 CSS 都由同一个 GitHub Pages 站点提供；
Piapro、KAMITSUBAKI 等外部地址只作为用户主动点击的资料来源链接。

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

## 手动部署

部署不会在提交代码时自动触发。需要发布时，在 GitHub 仓库中打开：

```text
Actions → Deploy GitHub Pages → Run workflow → main
```

也可以使用已登录的 GitHub CLI：

```bash
gh workflow run deploy-pages.yml --ref main
gh run list --workflow deploy-pages.yml --limit 1
```

工作流会先运行格式、Lint、单元测试和生产构建，再以 `/kafu/` 为基础路径
生成 `dist`，最后通过 GitHub 官方 Pages artifact/deploy Actions 发布。

需要在本地验证同样的 Pages 构建时：

```bash
VITE_BASE_PATH=/kafu/ mise run build
python3 scripts/verify_pages_build.py dist /kafu/
python3 scripts/verify_pages_workflow.py .github/workflows/deploy-pages.yml
```

GitHub Pages 的发布源必须保持为 **GitHub Actions**。工作流文件位于：

```text
.github/workflows/deploy-pages.yml
```

## 版权说明

本仓库定位为非商业粉丝项目，不包含从官方应用或页面提取的模型资源。
