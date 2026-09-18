# Design QA

final result: passed

Scope: TRAE-branded frontend foundation covering the main Feishu community sections. Knowledge feed remains the closest visual reproduction; other sections preserve the observed layout families with TRAE mock content. This does not certify pixel-identical reproduction of every route or a Discourse backend migration.

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

## V2 foundation review — 2026-09-18

final result: passed for the scoped frontend adaptation

Walked the live home, AI prompts, courses and course detail, knowledge, works, channels and channel discussion/detail, current/past events, and profile. Reused the measured type and spacing tokens; additions deliberately use mock TRAE content, text lessons, local reservations and a simulated member.

### Same-input mobile comparisons

Source and implementation were captured together in 390×844 CSS-pixel iframes at 1:1 scale. Inputs were the corresponding section's initial state. Public source headers show sign-in; the prototype has a simulated member. Evidence is session-local, not committed source-account screenshots:

- `/workspace/scratch/8343c2a5b05c/courses-v2-comparison.jpg`
- `/workspace/scratch/8343c2a5b05c/home-v2-comparison.jpg`
- `/workspace/scratch/8343c2a5b05c/events-v2-comparison.jpg`
- `/workspace/scratch/8343c2a5b05c/channels-v2-before.jpg`
- `/workspace/scratch/8343c2a5b05c/channels-v2-comparison.jpg`

Desktop implementation was inspected at 1363×936; final homepage screenshot is `docs/home-preview.jpg`. Existing V1 desktop and focused typography comparisons above cover the retained knowledge-feed baseline. The V2 mobile side-by-side screenshots are already unscaled, allowing direct inspection of type, icons and line breaks without another crop. AI and works were also compared live at the same mobile size.

### Findings and fixes

1. P2 course density: initial mobile two-column cards diverged from the source's horizontal rows. Changed to 138×78 covers beside the title and lesson metadata. Recapture confirms a readable one-column list.
2. P2 events: restored a narrow date column, vertical rule and event nodes rather than generic stacked cards. Recapture confirms the timeline remains readable at 390px.
3. P2 home: mobile welcome panel and full-width selector rows pushed discussions below the fold. Hid the desktop welcome panel on mobile, used compact labelled slide controls, and showed one discussion with a working refresh control. Recapture restores the source-like first-fold rhythm.
4. P2 channel imagery: repeated abstract decoration did not distinguish channels. Used local course-cover imagery cropped to the right, preserved clean text space, and reduced the mobile directory banner from 240px to 100px. Final recapture confirms headings and subscription controls remain separate from image subjects.
5. Development hot reload exposed a transient context-identity error while the shared UI module was being replaced. Moved React context into a separate stable module. A fresh browser session renders normally with no application errors in its logs; inspection-extension errors are excluded.

### Required surfaces

- Typography: system Chinese font stack, restrained 14–18px body/title hierarchy, larger page headings; mobile long titles wrap instead of overflowing. The source's malformed long-author wrapping is not reproduced.
- Spacing/layout: shared desktop content width and grid retained, mobile gutters and flat course rows checked, channel radii and timeline alignment inspected.
- Colors: source neutral grays retained, interactive blue replaced with TRAE green, selected/disabled/error states remain distinguishable.
- Images: local raster covers remain sharp at display size, mask crops preserve subjects; generated robots are mock editorial art, not official TRAE IP.
- Copy: standalone TRAE labels, coherent mock summaries, explicit local-data guidance; no private reference profile data copied.
- Icons/accessibility: captured icon family, labelled controls, visible focus, keyboard tabs, modal focus trapping/Escape/restore, semantic button/link separation and reduced motion styles. Mobile viewport testing uses browser frames, not hardware devices or a complete screen-reader audit.

### Functional evidence

- Draft survives close/reopen; required-field validation works.
- Publish, edit, comment, bookmark and reload retain expected content. Confirmed deletion removes the post and its related bookmark/comment state.
- A completed lesson survives reload and appears as 1/3 in personal learning.
- Subscription survives reload and appears in personal subscriptions.
- Event reservation survives reload; cancellation confirmation resets it.
- Channel tab state survives reload and browser back/forward.
- Mobile navigation opens personal center.
- Domain/storage/route validation and Worker smoke coverage run through `npm test`; formatting and production build are release gates.

Remaining scope boundaries: mock text lessons instead of video infrastructure; no real identity, server-side authorization, review queue, notifications, cross-device persistence or Discourse integration. Other section templates intentionally adapt the source, rather than claiming an exhaustive 1:1 clone.
