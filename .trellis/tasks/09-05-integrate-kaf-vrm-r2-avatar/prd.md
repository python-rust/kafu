# 集成 R2 托管的花谱 VRM 网页角色

## Goal

在现有花谱观察站中增加一个可正常展示、可降级、可后续由 AI/TTS 驱动的花谱 VRM 网页角色。模型大文件存放在 Cloudflare R2，浏览器只通过同源的 Cloudflare Pages Function 路径获取模型；网页代码、代理逻辑、配置、测试、部署流程和可公开的授权/来源摘要由 Git 仓库管理。

## Confirmed Facts

- 项目是 Vite + React + TypeScript 静态站，当前通过手动触发的 GitHub Actions 工作流部署到 Cloudflare Pages 项目 `kafu`。
- Cloudflare Account ID 已配置为 GitHub Actions variable `CLOUDFLARE_ACCOUNT_ID`，仓库已有 Actions secret `CLOUDFLARE_API_TOKEN`。
- 本机 Wrangler 已登录到同一 Cloudflare Account，现有 Pages 项目 `kafu` 可见。
- Cloudflare Account 已启用 R2；本机 `wrangler r2 bucket list` 已成功返回，当前账户尚无 R2 bucket。
- 已授权使用的原始模型已移动到 `.local-assets/kaf-avatar/original/kaf_fukuro_hatdown.vrm`。
- 原始模型大小为 `49,911,472` bytes，SHA-256 为 `5fe890c94a7af1e5df13a212203cf3d79a7d9d429aaac9750aee151e5918dae3`。
- `.local-assets/` 已写入本仓库的 `.git/info/exclude`，模型不会进入 Git 工作树或公开仓库。
- 模型内部作者字段为 `mme`；用户已确认模型作者允许将该 VRM 用于当前网站。
- 本任务暂不优化、压缩或重新导出 VRM；直接以当前模型验证完整 R2 → Pages Function → 浏览器展示链路。
- 产品位置采用独立“动态形象”区，放在“认识花谱”之后、“成长轨迹”之前。保留现有 Hero，不做全局悬浮挂件。

## Requirements

1. 创建项目专用 Cloudflare R2 bucket `kafu-runtime-assets`；真实 VRM 对象只存放于 R2，不提交到普通 Git 或 Git LFS。
2. R2 对象使用带内容哈希的不可变对象 key；仓库保存对象 key、字节数、SHA-256 与模型元数据，不保存 VRM 二进制。
3. 使用 Cloudflare Pages Function 代理 R2，使浏览器和开源仓库访问者都能通过当前 Pages 站点的公开、同源、不可变 URL 获取模型；不直接依赖 R2 公共域名。
4. Pages Function 只允许读取仓库锁定的角色资产，并正确处理 GET、HEAD、方法不允许、缺失对象、内容类型、内容长度、ETag 与不可变缓存。
5. 模型上传、远端校验和网页部署尽可能自动化；凭据只使用本地 Wrangler 登录或 GitHub Actions secrets/variables，不写入仓库。
6. 在首页新增“动态形象”区，位置在人物介绍之后、成长轨迹之前；角色采用延迟加载，加载前和失败时有静态 poster/fallback，不阻塞现有首屏图片和正文。
7. 使用成熟的 Three.js 与 `@pixiv/three-vrm` 运行时，不自行实现 VRM 解析、MToon、Humanoid、Expression 或 SpringBone。
8. 第一版至少正确展示模型，并支持程序化待机、自动眨眼、轻微视线变化和 SpringBone 更新；AI/TTS 业务接入只保留清晰扩展边界，不实现完整聊天系统。
9. 兼容 `prefers-reduced-motion`、页面后台暂停、角色离开视口暂停、React StrictMode 清理和 WebGL/模型加载失败降级。
10. 更新 README 与公开素材来源/授权摘要，明确模型作者、格式、大小、SHA-256、R2 托管原因和公开下载 URL；公开文案仅陈述可核实事实：模型制作 `mme`，经作者授权用于本网站。私人聊天内容、联系方式和完整授权截图不提交到公开仓库。
11. 将 R2 bucket、对象发布、Pages Function binding、发布顺序、验证、回滚和凭据要求写入 Trellis deployment/media specs。
12. 按项目既有 `mise` 流程完成类型检查、lint、单测、构建、浏览器 E2E、静态构建校验和真实部署 smoke test。
13. 页面导航增加“动态形象”锚点，保持现有固定头部、语义阅读顺序和 320px 起的响应式可用性。

## Acceptance Criteria

- [x] R2 bucket `kafu-runtime-assets` 已通过可重复命令建立，并配置为 Pages Function 的 `KAF_AVATAR_ASSETS` binding。
- [x] 原始 VRM 不在 Git tracked files、Git LFS 或 Pages `dist` 中。
- [x] VRM 已上传到带 SHA-256 前缀的不可变 R2 key，远端对象的字节数与完整内容 SHA-256 和仓库锁定信息一致。
- [x] 生产网页通过同源 Pages Function URL 成功加载模型；README/公开 manifest 同时提供该不可变下载 URL，访问者可以直接下载并校验模型；浏览器不直接请求 R2 公共域名。
- [x] Pages Function 对允许的 GET/HEAD 返回正确状态、内容类型、内容长度、ETag 与缓存策略，并对非法路径、缺失对象和非读取方法安全失败。
- [x] 首页在模型区域接近视口之前不下载 VRM；加载期间显示 poster，失败/WebGL 不可用/减少动态效果时保持可理解的静态体验。
- [x] 正常浏览器中人物可见，正面半身构图稳定，自动眨眼、轻微待机/视线和模型 SpringBone 正常更新。
- [x] 页面离开视口或进入后台时停止渲染循环，恢复可见后继续；卸载时完整释放动画帧、观察器和 Three.js/VRM 资源。
- [x] 模型作者授权摘要和来源记录已进入现有 `src/assets/kaf/ATTRIBUTION.md` 体系，页面继续保留非官方、非商业边界。
- [x] R2/Pages Function 的部署、发布、回滚和验证流程已写入 Trellis specs，并与实际脚本、配置和工作流一致。
- [x] `mise run check`、相关 E2E、静态构建验证与生产 smoke test 全部通过。
- [x] 任务完成后按 Trellis 要求更新 spec、提交改动并进入已验收任务的归档批次。

## Out of Scope

- VRM 纹理降采样、网格压缩、重新导出或体积优化。
- 从零生成新的 VRM/Live2D/PSD 角色模型。
- 完整 LLM 聊天、MCP 工具系统、ASR 或 TTS 服务接入。
- 摄像头面捕、全身动作捕捉或直播平台接入。
- 将 Blender 工程、源纹理、原始压缩包或私人授权证据提交到公开仓库。
- 为当前模型新增 VRMA 动作资产；第一版使用程序化待机。

## Open Questions

无阻断问题。若 GitHub Actions 中现有 Cloudflare Token 无法应用 R2 binding，将在实际部署失败证据出现后再请求更新同名 secret；本地实现、R2 上传和验证不因此提前停止。
