# 花谱观察站

面向中文读者的花谱（花譜 / KAF）非官方资料站。项目整理人物简介、2018 年以来的活动轨迹、代表专辑、视觉作品和官方平台入口；资料与图片来源集中列在页面底部。

**[访问花谱观察站](https://kafu-8bd.pages.dev/)**

## 页面内容

- **人物介绍**：花谱的基本资料、所属团队和主要活动形式。
- **动态形象**：在网页中延迟加载由 mme 制作并授权展示的花谱 VRM。
- **成长轨迹**：按年份整理重要作品、演出和活动节点。
- **代表作品**：收录《観測α》《魔法α》《狂想β》《寓話》《深愛》等原创专辑。
- **视觉档案**：浏览站内收录的插画与演出视觉，并支持放大查看。
- **官方入口**：汇总官方网站、哔哩哔哩、YouTube 等官方账号。

## 技术实现

- React 19、TypeScript、Vite
- Motion 与 Scrollama
- Yet Another React Lightbox
- Three.js 与 `@pixiv/three-vrm`
- Cloudflare R2 与 Pages Function 同源模型代理
- 响应式 WebP 与按阅读顺序执行的低优先级图片预热
- 系统中文无衬线与宋体字体栈，不下载额外 WebFont
- Vitest、Testing Library、Playwright

页面支持桌面端和移动端。系统开启“减少动态效果”后，成长轨迹会改为普通列表，内容不会缺失。

## 角色模型

本网站使用由 **mme** 制作、经作者授权用于本网站展示的花谱 VRM 模型。模型文件体积较大，不进入 Git 历史；Cloudflare R2 保存真实二进制，Pages Function 提供公开、同源、带版本的下载地址。

- 模型：`kaf_fukuro_hatdown.vrm`
- 格式：VRM 0.x
- 大小：49,911,472 bytes（约 47.6 MiB）
- SHA-256：`5fe890c94a7af1e5df13a212203cf3d79a7d9d429aaac9750aee151e5918dae3`
- [下载当前模型](https://kafu-8bd.pages.dev/assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm)
- [查看机器可读模型清单](https://kafu-8bd.pages.dev/assets/models/kaf/manifest.json)

公开下载用于让站点构建与模型版本可复现，不代表本仓库向下载者授予模型、角色或相关素材的额外许可。具体来源与使用边界见[素材来源与使用说明](src/assets/kaf/ATTRIBUTION.md)。

## 本地开发

项目使用 `mise` 固定 Node.js 和 pnpm 版本。安装好 `mise` 后，在仓库目录运行：

```bash
mise run install
mise run dev
```

常用命令：

| 命令                   | 用途                           |
| ---------------------- | ------------------------------ |
| `mise run dev`         | 启动本地开发服务器             |
| `mise run build`       | 类型检查并生成生产构建         |
| `mise run test`        | 运行 Vitest 测试               |
| `mise run check`       | 运行格式、Lint、测试和构建检查 |
| `mise run e2e-install` | 安装 Playwright Chromium       |
| `mise run e2e`         | 运行浏览器端回归测试           |

使用 `mise tasks ls` 可以查看全部任务。

## 发布

生产站点托管在 Cloudflare Pages，VRM 大文件存放在 Cloudflare R2。模型先使用仓库中的发布脚本上传到不可变 R2 key，网页再通过 Pages Function 的同源路径读取。代码推送不会自动上线；需要发布时，在 GitHub Actions 中运行 **Deploy Cloudflare Pages** 工作流即可。工作流会自动完成质量检查、生产构建、静态资源校验、部署和线上页面/模型代理检查。

也可以使用 GitHub CLI 一键触发：

```bash
gh workflow run deploy-cloudflare-pages.yml --ref main
```

## 目录结构

| 路径                       | 内容                                     |
| -------------------------- | ---------------------------------------- |
| `src/content/kaf.ts`       | 人物、时间线、专辑和官方链接数据         |
| `src/content/kafAvatar.ts` | VRM 对象 key、公开地址、大小与哈希锁定   |
| `src/pages/HomePage/`      | 首页组件与各内容区块                     |
| `src/assets/kaf/`          | 图片素材、响应式派生文件和来源记录       |
| `functions/`               | Cloudflare Pages Function 与 R2 模型代理 |
| `scripts/kaf-avatar/`      | 本地模型发布、校验和 Poster 生成工具     |
| `tests/`                   | 单元测试、组件测试和 Playwright 回归测试 |

## 内容与素材

人物和作品资料集中维护在 `src/content/kaf.ts`。新增或替换图片时，需要同步记录来源、署名和使用条件，详见 [素材来源与使用说明](src/assets/kaf/ATTRIBUTION.md)。

## 版权说明

本项目是非官方、非商业粉丝站，与花谱及 KAMITSUBAKI STUDIO 无隶属关系。花谱、KAMITSUBAKI STUDIO、作品名称、图片及其他相关素材的权利归各自权利人所有。项目所用字体和第三方依赖遵循各自许可证。

如权利人希望调整或移除相关内容，请通过仓库的 [Issue](https://github.com/python-rust/kafu/issues) 联系。
