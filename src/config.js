// Operations can reorder, rename or hide sections without changing page code.
export const sections = [
  { id: "home", label: "首页", template: "home" },
  { id: "ai", label: "AI充电站", template: "ai" },
  { id: "courses", label: "课程", template: "courses" },
  {
    id: "knowledge",
    label: "知识",
    template: "feed",
    types: ["教程", "交流", "公告", "问答"],
  },
  { id: "works", label: "作品", template: "feed", types: ["作品"] },
  { id: "channels", label: "频道", template: "channels" },
  { id: "events", label: "活动", template: "events" },
].map((s) => ({ ...s, enabled: true }));
export const communityConfig = {
  name: "TRAE 社区",
  pageSize: 6,
  defaultSection: "knowledge",
  maxTitle: 80,
  maxSummary: 160,
  maxBody: 20000,
  maxComment: 2000,
};
export const postCategories = [
  { label: "技巧分享", type: "教程" },
  { label: "案例与作品", type: "作品" },
  { label: "互动交流", type: "交流" },
  { label: "帮助与支持", type: "问答" },
];
export const channelTabs = [
  ["overview", "首页"],
  ["discussion", "讨论区"],
  ["courses", "课程"],
  ["articles", "文章"],
  ["works", "作品"],
  ["events", "活动"],
];
export const profileTabs = [
  ["learning", "最近学习"],
  ["posts", "我的投稿"],
  ["bookmarks", "收藏"],
  ["subscriptions", "订阅"],
  ["registrations", "活动报名"],
  ["following", "关注"],
];
