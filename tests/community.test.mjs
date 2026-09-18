import test from "node:test";
import assert from "node:assert/strict";
import {
  parseRoute,
  routeUrl,
  getFilters,
  selectArticles,
  paginate,
  toggleValue,
  eventStatus,
  courseProgress,
  createPost,
  validatePost,
} from "../src/core/model.js";
import {
  initialState,
  normalizeState,
  loadState,
  createRepository,
  reduceCommunity,
  STORAGE_KEY,
} from "../src/core/repository.js";
import { articles, courses, channels, events, viewer } from "../src/catalog.js";
import { sections } from "../src/config.js";
const draft = {
  title: "测试投稿",
  summary: "简介",
  body: "这是正文",
  category: "互动交流",
  channelId: "start",
  scene: "产品研发",
};
const memory = () => {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
  };
};
for (const s of sections)
  test("route: " + s.id, () =>
    assert.equal(parseRoute(routeUrl(s.id)).page, s.id),
  );
test("legacy article links remain valid", () =>
  assert.deepEqual(parseRoute("#article/1"), {
    page: "article",
    id: "1",
    params: {},
  }));
test("query and unicode survive roundtrip", () => {
  const r = parseRoute(
    routeUrl("search", null, { q: "MCP & 项目", topic: "工作提效", page: 2 }),
  );
  assert.equal(r.params.q, "MCP & 项目");
  assert.equal(r.params.page, "2");
});
test("unknown, malformed and missing IDs resolve to 404", () => {
  for (const hash of [
    "#nonsense",
    "#article",
    "#article/%E0%A4",
    "#knowledge/1",
    "#article/1/extra",
  ])
    assert.equal(parseRoute(hash).page, "404");
});
test("filters are OR within dimension and AND across dimensions", () => {
  const f = getFilters({ scene: "产品研发,工作提效", product: "MCP" });
  const result = selectArticles(articles, { filters: f });
  assert.deepEqual(
    result.map((a) => a.id),
    ["2"],
  );
});
test("search handles case and whitespace", () =>
  assert.deepEqual(
    selectArticles(articles, { section: "search", query: " mCp " }).map(
      (a) => a.id,
    ),
    ["2"],
  ));
test("section configuration controls feed types", () =>
  assert.ok(
    selectArticles(articles, { section: "works" }).every(
      (a) => a.type === "作品",
    ),
  ));
test("pagination clamps hostile page values and handles empty lists", () => {
  for (const page of ["NaN", -8, 0, 999, "Infinity"]) {
    const p = paginate(articles, page);
    assert.ok(p.page >= 1 && p.page <= p.pages);
  }
  assert.equal(paginate([], 50).page, 1);
  assert.equal(paginate([], 1).total, 0);
});
test("latest sorting uses consistent epoch timestamps", () => {
  const p = createPost(draft, {
    id: "local-test",
    now: Date.UTC(2026, 9, 1),
    author: viewer,
  });
  assert.equal(
    selectArticles([p, ...articles], { sort: "latest" })[0].id,
    p.id,
  );
});
test("toggle is reversible and never adds a duplicate", () => {
  assert.deepEqual(toggleValue(["a"], "a"), []);
  assert.deepEqual(toggleValue([], "a"), ["a"]);
});
test("event boundaries are exclusive at end", () => {
  const e = events[0],
    start = Date.parse(e.start),
    end = Date.parse(e.end);
  assert.equal(eventStatus(e, start - 1), "upcoming");
  assert.equal(eventStatus(e, start), "ongoing");
  assert.equal(eventStatus(e, end), "ended");
});
test("course progress ignores unknown and duplicate lesson IDs", () => {
  const c = courses[0];
  assert.equal(
    courseProgress(c, [c.lessons[0].id, c.lessons[0].id, "bad"]).completed,
    1,
  );
  assert.equal(
    courseProgress(
      c,
      c.lessons.map((l) => l.id),
    ).percent,
    100,
  );
});
test("post categories map to correct content types", () => {
  for (const [category, type] of [
    ["技巧分享", "教程"],
    ["案例与作品", "作品"],
    ["互动交流", "交流"],
    ["帮助与支持", "问答"],
  ])
    assert.equal(
      createPost(
        { ...draft, category },
        { id: "local-1", now: 0, author: viewer },
      ).type,
      type,
    );
});
test("whitespace and overlong submissions are rejected", () => {
  for (const bad of [
    { title: "  " },
    { body: "\n " },
    { title: "x".repeat(81) },
    { body: "x".repeat(20001) },
    { summary: "x".repeat(161) },
    { category: "unknown" },
  ])
    assert.ok(validatePost({ ...draft, ...bad }));
});
test("normalization rejects invalid shapes without crashing", () => {
  for (const raw of [
    null,
    [],
    42,
    "text",
    { bookmarks: 42, posts: {}, comments: [], progress: [] },
    {
      bookmarks: [1, null, "1", "1"],
      following: [-1, 100, "0", 0],
      posts: [null, {}, []],
    },
  ]) {
    const s = normalizeState(raw);
    assert.ok(Array.isArray(s.posts));
    assert.ok(Array.isArray(s.bookmarks));
  }
});
test("poisoned object keys cannot become prototype mutations", () => {
  const s = normalizeState(
    JSON.parse(
      '{"comments":{"__proto__":[{"text":"x"}]},"progress":{"__proto__":["x"]}}',
    ),
  );
  assert.equal(Object.getPrototypeOf(s.comments), Object.prototype);
  assert.equal(Object.getPrototypeOf(s.progress), Object.prototype);
});
test("malformed JSON and blocked storage recover", () => {
  const s = memory();
  s.setItem(STORAGE_KEY, "{broken");
  assert.deepEqual(loadState(s), initialState());
  assert.deepEqual(
    loadState({
      getItem() {
        throw Error("blocked");
      },
    }),
    initialState(),
  );
});
test("legacy bookmarks, comments and drafts migrate", () => {
  const s = memory();
  s.setItem("trae-community:bookmarks", '["2"]');
  s.setItem(
    "trae-community:draft",
    JSON.stringify({ ...draft, type: "案例与作品", category: undefined }),
  );
  s.setItem(
    "trae-community:comments",
    '{"1":[{"text":"hello","date":"刚刚"}]}',
  );
  const v = loadState(s);
  assert.deepEqual(v.bookmarks, ["2"]);
  assert.equal(v.draft.category, "案例与作品");
  assert.ok(v.comments["1"][0].id);
});
test("legacy authored posts normalize to current viewer", () => {
  const s = normalizeState({
    posts: [{ ...articles[0], id: "local-1", body: "测试正文" }],
  });
  assert.equal(s.posts[0].author, viewer);
});
test("draft publish is one transaction and clears draft", () => {
  const s = reduceCommunity(initialState(), {
    type: "publish",
    draft,
    id: "local-1",
    now: 1,
  });
  assert.equal(s.posts[0].title, draft.title);
  assert.equal(s.draft.body, "");
});
test("editing preserves identity, created time and own author", () => {
  const s = reduceCommunity(initialState(), {
    type: "publish",
    draft,
    id: "local-1",
    now: 1,
  });
  const v = reduceCommunity(s, {
    type: "edit",
    draft: { ...draft, title: "新标题" },
    id: "local-1",
    now: 5,
  });
  assert.equal(v.posts[0].stamp, 1);
  assert.equal(v.posts[0].updatedAt, 5);
  assert.equal(v.posts[0].title, "新标题");
  assert.throws(() =>
    reduceCommunity(s, { type: "edit", id: "1", draft, now: 5 }),
  );
});
test("deletion removes dangling interactions and comments", () => {
  const s = {
    ...initialState(),
    posts: [createPost(draft, { id: "local-1", now: 1, author: viewer })],
    likes: ["local-1", "2"],
    bookmarks: ["local-1"],
    comments: { "local-1": [{ id: "c", text: "hi" }] },
  };
  const v = reduceCommunity(s, { type: "delete", id: "local-1" });
  assert.equal(v.posts.length, 0);
  assert.deepEqual(v.likes, ["2"]);
  assert.deepEqual(v.bookmarks, []);
  assert.equal(v.comments["local-1"], undefined);
  assert.equal(s.posts.length, 1);
});
test("invalid comments do not mutate state", () => {
  const s = initialState();
  for (const text of ["   ", "x".repeat(2001)])
    assert.throws(() =>
      reduceCommunity(s, { type: "comment", text, articleId: "1" }),
    );
  assert.deepEqual(s, initialState());
});
test("comment deletion affects only requested comment", () => {
  let s = initialState();
  for (const id of ["a", "b"])
    s = reduceCommunity(s, {
      type: "comment",
      articleId: "1",
      text: "hi",
      id,
      date: "today",
    });
  s = reduceCommunity(s, { type: "delete-comment", articleId: "1", id: "a" });
  assert.deepEqual(
    s.comments["1"].map((c) => c.id),
    ["b"],
  );
});
test("lesson completion is reversible and persisted", () => {
  const r = createRepository(memory());
  r.dispatch({ type: "lesson", courseId: "c", lessonId: "l" });
  assert.deepEqual(r.getSnapshot().progress.c, ["l"]);
  r.dispatch({ type: "lesson", courseId: "c", lessonId: "l" });
  assert.deepEqual(r.getSnapshot().progress.c, []);
});
test("repository survives quota failure with explicit memory status", () => {
  const r = createRepository({
    getItem: () => null,
    setItem() {
      throw Error("quota");
    },
  });
  r.dispatch({ type: "toggle", key: "bookmarks", id: "1" });
  assert.deepEqual(r.getSnapshot().bookmarks, ["1"]);
  assert.equal(r.getStatus(), "memory");
});
test("repository reload restores state", () => {
  const storage = memory();
  const r = createRepository(storage);
  r.dispatch({ type: "toggle", key: "subscriptions", id: "agents" });
  assert.deepEqual(createRepository(storage).getSnapshot().subscriptions, [
    "agents",
  ]);
});
test("cross-tab updates notify and dispose removes listener", () => {
  let handler,
    removed = false,
    calls = 0;
  const storage = memory();
  const target = {
    addEventListener(n, fn) {
      handler = fn;
    },
    removeEventListener(n, fn) {
      removed = handler === fn;
    },
  };
  const r = createRepository(storage, target);
  r.subscribe(() => calls++);
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...initialState(), bookmarks: ["3"] }),
  );
  handler({ key: STORAGE_KEY });
  assert.deepEqual(r.getSnapshot().bookmarks, ["3"]);
  assert.equal(calls, 1);
  r.dispose();
  assert.ok(removed);
});
test("seed references are consistent", () => {
  const ids = new Set();
  for (const a of articles) {
    assert.ok(!ids.has(a.id));
    ids.add(a.id);
    assert.ok(channels.some((c) => c.id === a.channelId));
  }
  for (const c of courses) {
    assert.ok(channels.some((x) => x.id === c.channelId));
    assert.equal(new Set(c.lessons.map((l) => l.id)).size, c.lessons.length);
  }
});

test("malformed display fields in persisted posts are normalized", () => {
  const s = normalizeState({
    posts: [
      {
        id: "local-x",
        title: "标题",
        body: "正文",
        tags: [],
        date: { bad: true },
        scene: [],
        channelId: 1,
      },
    ],
  });
  assert.equal(s.posts[0].date, "之前");
  assert.equal(s.posts[0].scene, "产品研发");
  assert.equal(s.posts[0].channelId, "start");
});
