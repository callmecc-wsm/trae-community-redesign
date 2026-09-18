import { toggleValue, createPost, validatePost } from "./model.js";
import { viewer } from "../catalog.js";
export const STORAGE_KEY = "trae-community:v2";
const record = (x) => x && typeof x === "object" && !Array.isArray(x);
const strings = (x) =>
  Array.isArray(x) ? [...new Set(x.filter((v) => typeof v === "string"))] : [];
const text = (x, max = 20000) => (typeof x === "string" ? x.slice(0, max) : "");
export const blankDraft = () => ({
  title: "",
  summary: "",
  body: "",
  category: "技巧分享",
  scene: "产品研发",
  channelId: "start",
});
export const initialState = () => ({
  version: 2,
  likes: [],
  bookmarks: [],
  following: [],
  subscriptions: [],
  registrations: [],
  progress: {},
  posts: [],
  comments: {},
  draft: blankDraft(),
});
export function normalizeState(raw) {
  const s = initialState();
  if (!record(raw)) return s;
  for (const key of ["likes", "bookmarks", "subscriptions", "registrations"])
    s[key] = strings(raw[key]);
  s.following = Array.isArray(raw.following)
    ? [
        ...new Set(
          raw.following.filter(
            (n) => Number.isInteger(n) && n >= 0 && n < viewer,
          ),
        ),
      ]
    : [];
  if (record(raw.progress))
    for (const [id, v] of Object.entries(raw.progress))
      if (!["__proto__", "constructor", "prototype"].includes(id))
        s.progress[id] = strings(v);
  const seen = new Set();
  if (Array.isArray(raw.posts))
    s.posts = raw.posts
      .filter(
        (p) =>
          record(p) &&
          typeof p.id === "string" &&
          p.id.startsWith("local-") &&
          typeof p.title === "string" &&
          p.title.trim() &&
          typeof p.body === "string" &&
          Array.isArray(p.tags) &&
          !seen.has(p.id) &&
          seen.add(p.id),
      )
      .map((p) => ({
        ...p,
        title: text(p.title, 80),
        summary: text(p.summary, 160),
        body: text(p.body),
        date: text(p.date, 80) || "之前",
        scene: text(p.scene, 60) || "产品研发",
        channelId: text(p.channelId, 60) || "start",
        tags: strings(p.tags),
        author: viewer,
        type: ["教程", "作品", "交流", "问答"].includes(p.type)
          ? p.type
          : "教程",
        cover: ["build", "start", "mcp", "data"].includes(p.cover)
          ? p.cover
          : "start",
        stamp: Number.isFinite(p.stamp) ? p.stamp : 0,
        rank: Number.isFinite(p.rank) ? p.rank : 0,
        likes: 0,
        saved: 0,
        local: true,
      }));
  if (record(raw.comments))
    for (const [id, v] of Object.entries(raw.comments))
      if (
        !["__proto__", "constructor", "prototype"].includes(id) &&
        Array.isArray(v)
      )
        s.comments[id] = v
          .filter(
            (c) => record(c) && typeof c.text === "string" && c.text.trim(),
          )
          .map((c, i) => ({
            id: text(c.id) || `legacy-${id}-${i}`,
            text: text(c.text, 2000),
            date: text(c.date, 80) || "之前",
            author: viewer,
          }));
  if (record(raw.draft))
    s.draft = {
      ...blankDraft(),
      title: text(raw.draft.title, 80),
      summary: text(raw.draft.summary, 160),
      body: text(raw.draft.body),
      category: text(raw.draft.category || raw.draft.type, 30) || "技巧分享",
      channelId: text(raw.draft.channelId, 60) || "start",
      scene: text(raw.draft.scene, 60) || "产品研发",
    };
  return s;
}
export function loadState(storage) {
  try {
    const current = storage.getItem(STORAGE_KEY);
    if (current) return normalizeState(JSON.parse(current));
    const legacy = {};
    for (const k of [
      "likes",
      "bookmarks",
      "following",
      "posts",
      "comments",
      "draft",
    ]) {
      try {
        legacy[k] = JSON.parse(storage.getItem("trae-community:" + k));
      } catch {}
    }
    return normalizeState(legacy);
  } catch {
    return initialState();
  }
}
export function reduceCommunity(state, action) {
  const next = { ...state };
  if (action.type === "toggle") {
    if (
      ![
        "likes",
        "bookmarks",
        "following",
        "subscriptions",
        "registrations",
      ].includes(action.key)
    )
      throw Error("不支持的操作");
    next[action.key] = toggleValue(state[action.key], action.id);
  } else if (action.type === "draft")
    next.draft = { ...state.draft, ...action.value };
  else if (action.type === "publish") {
    const post = createPost(action.draft, {
      id: action.id,
      now: action.now,
      author: viewer,
    });
    next.posts = [post, ...state.posts];
    next.draft = blankDraft();
  } else if (action.type === "edit") {
    if (!state.posts.some((p) => p.id === action.id))
      throw Error("只能编辑自己的投稿");
    const error = validatePost(action.draft);
    if (error) throw Error(error);
    next.posts = state.posts.map((p) =>
      p.id === action.id
        ? {
            ...createPost(action.draft, {
              id: p.id,
              now: p.stamp,
              author: viewer,
            }),
            updatedAt: action.now,
          }
        : p,
    );
  } else if (action.type === "delete") {
    if (!state.posts.some((p) => p.id === action.id))
      throw Error("只能删除自己的投稿");
    next.posts = state.posts.filter((p) => p.id !== action.id);
    next.bookmarks = state.bookmarks.filter((id) => id !== action.id);
    next.likes = state.likes.filter((id) => id !== action.id);
    next.comments = { ...state.comments };
    delete next.comments[action.id];
  } else if (action.type === "comment") {
    const t = action.text.trim();
    if (!t || t.length > 2000) throw Error("评论需要 1–2000 字");
    next.comments = {
      ...state.comments,
      [action.articleId]: [
        ...(state.comments[action.articleId] || []),
        { id: action.id, text: t, date: action.date, author: viewer },
      ],
    };
  } else if (action.type === "delete-comment")
    next.comments = {
      ...state.comments,
      [action.articleId]: (state.comments[action.articleId] || []).filter(
        (c) => c.id !== action.id,
      ),
    };
  else if (action.type === "lesson")
    next.progress = {
      ...state.progress,
      [action.courseId]: toggleValue(
        state.progress[action.courseId] || [],
        action.lessonId,
      ),
    };
  else throw Error("未知操作");
  return next;
}
// All persistence is behind this interface. Replace the adapter when adding a server.
export function createRepository(storage, eventTarget) {
  let state = loadState(storage),
    status = "ready";
  const listeners = new Set();
  function emit() {
    listeners.forEach((fn) => fn());
  }
  const sync = (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      state = loadState(storage);
      status = "ready";
      emit();
    }
  };
  eventTarget?.addEventListener("storage", sync);
  return {
    getSnapshot: () => state,
    getStatus: () => status,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    dispatch(action) {
      const next = reduceCommunity(state, action);
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(next));
        status = "ready";
      } catch {
        status = "memory";
      }
      state = next;
      emit();
      return state;
    },
    dispose() {
      eventTarget?.removeEventListener("storage", sync);
      listeners.clear();
    },
  };
}
