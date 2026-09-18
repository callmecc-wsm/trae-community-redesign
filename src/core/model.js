import { communityConfig, sections, postCategories } from "../config.js";
import { filters } from "../data.js";
export const emptyFilters = () =>
  Object.fromEntries(filters.map((f) => [f.key, []]));
export function parseRoute(hash = "") {
  try {
    const [path, qs = ""] = hash.replace(/^#\/?/, "").split("?");
    const bits = path.split("/").filter(Boolean).map(decodeURIComponent);
    const params = Object.fromEntries(new URLSearchParams(qs));
    if (!bits.length)
      return { page: communityConfig.defaultSection, id: null, params };
    const [page, id] = bits;
    const lists = [
      ...sections.filter((s) => s.enabled).map((s) => s.id),
      "profile",
      "search",
    ];
    const details = ["article", "course", "channel", "event", "prompt"];
    if (
      bits.length > 2 ||
      (!lists.includes(page) && !details.includes(page)) ||
      (details.includes(page) && !id) ||
      (lists.includes(page) && id)
    )
      return { page: "404", params: {} };
    return { page, id, params };
  } catch {
    return { page: "404", params: {} };
  }
}
export function routeUrl(page, id, params = {}) {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null),
  );
  return (
    "#" +
    page +
    (id ? "/" + encodeURIComponent(id) : "") +
    (q.size ? "?" + q : "")
  );
}
export function getFilters(params) {
  return Object.fromEntries(
    filters.map((f) => [
      f.key,
      (params[f.key] || "").split(",").filter(Boolean),
    ]),
  );
}
export function selectArticles(
  items,
  {
    section = "knowledge",
    query = "",
    filters: chosen = emptyFilters(),
    sort = "popular",
    channelId,
  } = {},
) {
  const config = sections.find((s) => s.id === section);
  const q = query.trim().toLocaleLowerCase();
  return items
    .filter(
      (a) =>
        (!config?.types || config.types.includes(a.type)) &&
        (!channelId || a.channelId === channelId) &&
        (!q ||
          [a.title, a.summary, ...a.tags]
            .join(" ")
            .toLocaleLowerCase()
            .includes(q)) &&
        Object.entries(chosen).every(
          ([key, values]) =>
            !values.length ||
            values.some((v) =>
              key === "scene" ? a.scene === v : a.tags.includes(v),
            ),
        ),
    )
    .sort((a, b) =>
      sort === "latest"
        ? b.stamp - a.stamp || a.id.localeCompare(b.id)
        : (a.rank ?? 999) - (b.rank ?? 999) || b.stamp - a.stamp,
    );
}
export function paginate(items, page = 1, size = communityConfig.pageSize) {
  const count = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(count, Math.max(1, Number.parseInt(page, 10) || 1));
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pages: count,
    total: items.length,
  };
}
export function toggleValue(items, id) {
  return items.includes(id) ? items.filter((x) => x !== id) : [...items, id];
}
export function eventStatus(event, now = Date.now()) {
  return now >= Date.parse(event.end)
    ? "ended"
    : now >= Date.parse(event.start)
      ? "ongoing"
      : "upcoming";
}
export function courseProgress(course, ids = []) {
  const completed = course.lessons.filter((l) => ids.includes(l.id)).length;
  return {
    completed,
    total: course.lessons.length,
    percent: Math.round((completed / course.lessons.length) * 100),
  };
}
export function validatePost(draft) {
  if (!draft?.title?.trim()) return "请填写标题。";
  if (draft.title.trim().length > communityConfig.maxTitle)
    return "标题不能超过 80 字。";
  if (!draft.body?.trim()) return "请填写正文。";
  if (draft.body.length > communityConfig.maxBody)
    return "正文不能超过 20000 字。";
  if ((draft.summary || "").length > communityConfig.maxSummary)
    return "简介不能超过 160 字。";
  if (!postCategories.some((c) => c.label === draft.category))
    return "请选择有效的板块。";
  return "";
}
export function createPost(draft, { id, now, author }) {
  const error = validatePost(draft);
  if (error) throw Error(error);
  const type = postCategories.find((c) => c.label === draft.category).type;
  return {
    id,
    title: draft.title.trim(),
    summary: draft.summary.trim() || draft.body.trim().slice(0, 150),
    body: draft.body.trim(),
    author,
    date: new Date(now).toLocaleDateString("zh-CN", {
      month: "long",
      day: "numeric",
    }),
    tags: [draft.category],
    type,
    scene: draft.scene || "产品研发",
    channelId: draft.channelId || "start",
    cover: type === "作品" ? "build" : "start",
    likes: 0,
    saved: 0,
    rank: -now,
    stamp: now,
    local: true,
  };
}
