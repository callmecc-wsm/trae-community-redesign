# Design QA

final result: passed

Scope: Feishu knowledge-feed layout adapted to TRAE branding and mock content, with a working desktop/mobile frontend. This does not certify every Feishu route or a Discourse backend migration.

## Source and evidence

- Source: https://www.feishu.cn/community/articles/wiki
- Source visual: `/workspace/scratch/feishu-reference.jpg`
- Browser-rendered implementation: `http://terminal.local:4173/`
- Implementation screenshot: `docs/preview.jpg`
- Full comparison: `/workspace/scratch/desktop-comparison-evidence.jpg` (both live pages rendered in equal-sized frames)
- Focused typography comparison: `/workspace/scratch/focused-comparison.jpg` (both live pages at CSS 1:1)
- Mobile comparison: `/workspace/scratch/trae-mobile-comparison.jpg`
- Source article detail was also inspected live and captured at `/workspace/scratch/feishu-detail.jpg`.

## Viewports and normalization

Desktop source and implementation: 1363×936 CSS px, device scale 1. Full comparison displays both at 0.48 scale within the same browser capture; focused text comparison is not scaled. Main content x=114, y=164, main column 808px, gap48px, sidebar272px. Mobile comparison: two 390×844 CSS-pixel iframes, rendered 1:1 in the same capture. Source iframe is logged out, prototype uses a simulated member; this header difference is intentional.

## Comparison history

1. P2 horizontal drift: default scrollbar was 15px instead of source 7px; content grid 1136px instead of 1128px. Corrected both. Post-fix desktop comparison confirms matching grid and margins.
2. P2 sidebar rhythm: ranking/card height and creator-row intervals differed by 4px. Corrected ranking to 48px rows /8px gaps and creator rows to 60px /8px gaps; card heights now 374px and434px.
3. P2 mobile drift: initial version retained thumbnails and a second navigation row. Live390px reference showed text-only rows and a hamburger header. Corrected covers, nav, font size, padding, filter scrolling and sort control. Post-fix mobile comparison confirms source structure. Source's first long author name wraps to three lines; mock authors stay single-line intentionally.
4. P2 article banner crop: a thumbnail with text was unsuitable for the shallow masthead. Replaced it with a separate abstract TRAE-green image, following the source's text-free art banner.
5. Asset validation: one avatar download returned a non-image document. Replaced it with an inspected local raster avatar; all final media are local raster files with valid natural dimensions. No remote image dependencies remain in the application.

## Required fidelity surfaces

- Typography: same font stack; titles18/28px500, body14/20px400, metadata14px, tags12px. Focused comparison checks weight, wrapping and line spacing.
- Layout: matched first-fold density, 252×142 covers, 16px cover/text spacing, 12px internal rhythm, sticky60px navigation, side-card radii12px and padding24/16px.
- Colors: neutral text #1f2329 and secondary #646a73 retained. Brand interactive color intentionally replaced with readable deep green #008b58. Light category colors retained.
- Imagery: four generated16:9 tutorial covers, local TRAE brand mark, a separate abstract article banner. Source UI icon SVGs are captured paths rather than approximations.
- Content: TRAE categories and realistic mock copy replace Feishu content. No source user profile or private account data is embedded in the code.

## Primary interaction checks

- Scene filter: selecting 数据分析 yields one matching article.
- Search: MCP produces matching results; suggestions and full-search input work.
- Latest sort brings the fresh discussion article to the top; returning to popular restores editorial order.
- Bookmark toggles aria-pressed and appears in 我的收藏; toggling off removes it.
- Empty contribution submit presents a visible validation error.
- Article links navigate to hash deep links; reloading retains the article view.
- Share dialog carries the article URL; Copy returns 链接已复制.
- Every rendered image reports a positive naturalWidth after loading.
- Browser error logs checked. Browser-extension metadata errors originate from the inspection extension; no application JavaScript exception observed.
- Production Vite build passed. The existing Sites Worker smoke suite is also run at handoff.

## Follow-up polish / boundaries

- Mobile is verified in live CSS-sized frames rather than hardware devices.
- Article body, author profiles and submission dialogs are functional mock adaptations; only the knowledge feed is held to the closest visual reproduction.
- Backend authentication, posting, moderation and Discourse integration are future implementation work.
- Generated robots are mock editorial illustrations, not official IP assets.
