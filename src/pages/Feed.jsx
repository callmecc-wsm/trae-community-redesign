import React from "react";
import { selectArticles, getFilters, routeUrl } from "../core/model.js";
import { patchRoute } from "../core/hooks.js";
import {
  useApp,
  ArticleCard,
  Empty,
  Sidebars,
  Pagination,
} from "../components/ui.jsx";
import { Filters } from "../components/Filters.jsx";
import { courses, channels, prompts } from "../catalog.js";
export function Feed({ route }) {
  const { all } = useApp();
  const q = route.params.q || "",
    chosen = getFilters(route.params),
    tags = Object.values(chosen).flat();
  const results = selectArticles(all, {
    section: route.page,
    query: q,
    sort: route.params.sort,
    filters: chosen,
  });
  const isSearch = route.page === "search";
  const extras =
    isSearch && q
      ? [
          ...courses.map((c) => ({ ...c, kind: "course", label: "课程" })),
          ...channels.map((c) => ({
            ...c,
            title: c.name,
            kind: "channel",
            label: "频道",
          })),
          ...prompts.map((c) => ({ ...c, kind: "prompt", label: "提示词" })),
        ].filter((x) =>
          (x.title + (x.summary || x.description || ""))
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
      : [];
  return (
    <main className="community-layout">
      <section className="feed" aria-label="社区文章">
        <Filters route={route} />
        {(q || tags.length > 0) && (
          <div className="filter-summary">
            <span>
              {q ? "“" + q + "” 的搜索结果" : "已筛选"} · {results.length} 篇
            </span>
            {Object.entries(chosen).flatMap(([key, values]) =>
              values.map((t) => (
                <button
                  key={key + t}
                  className="selected-pill"
                  aria-label={"移除筛选 " + t}
                  onClick={() =>
                    patchRoute(route, {
                      [key]: values.filter((v) => v !== t).join(","),
                      page: 1,
                    })
                  }
                >
                  {t} ×
                </button>
              )),
            )}
            <button
              onClick={() =>
                patchRoute(route, {
                  q: "",
                  scene: "",
                  product: "",
                  category: "",
                  topic: "",
                  page: 1,
                })
              }
            >
              清空筛选
            </button>
          </div>
        )}
        {extras.length > 0 && (
          <section className="search-extra">
            <h2>课程、频道与 AI 资源</h2>
            {extras.map((x) => (
              <a key={x.kind + x.id} href={routeUrl(x.kind, x.id)}>
                <span className="tag tag-green">{x.label}</span>
                {x.title}
              </a>
            ))}
          </section>
        )}
        <Pagination items={results} route={route}>
          {(items) => (
            <div className="article-list">
              {items.map((a) => (
                <ArticleCard a={a} key={a.id} />
              ))}
            </div>
          )}
        </Pagination>
        {!results.length && (
          <Empty
            title={extras.length ? "没有匹配的文章" : "暂时没有找到相关内容"}
            action={
              <button
                className="secondary"
                onClick={() =>
                  patchRoute(route, {
                    q: "",
                    scene: "",
                    product: "",
                    category: "",
                    topic: "",
                    page: 1,
                  })
                }
              >
                清空筛选
              </button>
            }
          />
        )}
        <div className="feed-end">每一次探索，都值得被看见</div>
      </section>
      <Sidebars />
    </main>
  );
}
