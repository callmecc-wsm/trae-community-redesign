import React, { useEffect, useRef } from "react";
import icons from "../icons.json";
import { creators } from "../catalog.js";
import { routeUrl, paginate } from "../core/model.js";
import { navigate, patchRoute } from "../core/hooks.js";
import { useApp } from "../core/context.js";
export { CommunityContext, useApp } from "../core/context.js";
export const cover = (a) => "/assets/cover-" + (a.cover || "start") + ".png";
export function Icon({ name, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={"icon " + className}
      dangerouslySetInnerHTML={{ __html: icons[name] || icons.RightOutlined }}
    />
  );
}
export function Avatar({ author = 0, size = 20 }) {
  const a = creators[author] || creators[0];
  return (
    <img
      className="avatar"
      width={size}
      height={size}
      src={"/assets/avatar-" + a.avatar + ".png"}
      alt=""
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/assets/trae-mark.png";
      }}
    />
  );
}
export function Empty({
  title = "暂时没有内容",
  description = "换个筛选条件试试，或者分享你的第一篇内容。",
  action,
}) {
  return (
    <div className="empty-state">
      <Icon name="SearchOutlined" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function NotFound() {
  return (
    <main className="not-found">
      <h1>这个页面暂时找不到了</h1>
      <p className="muted">
        链接可能已失效，本地投稿也只在创建它的浏览器中可见。
      </p>
      <button className="primary" onClick={() => navigate("knowledge")}>
        回到社区
      </button>
    </main>
  );
}
export function Tabs({ items, value, onChange, label = "内容分类" }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map(([id, title]) => (
        <button
          key={id}
          role="tab"
          tabIndex={value === id ? 0 : -1}
          onKeyDown={(e) => {
            const i = items.findIndex((x) => x[0] === id);
            const n =
              e.key === "ArrowRight"
                ? (i + 1) % items.length
                : e.key === "ArrowLeft"
                  ? (i - 1 + items.length) % items.length
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? items.length - 1
                      : null;
            if (n !== null) {
              e.preventDefault();
              onChange(items[n][0]);
              e.currentTarget.parentElement
                .querySelectorAll('[role="tab"]')
                [n]?.focus();
            }
          }}
          aria-selected={value === id}
          className={value === id ? "active" : ""}
          onClick={() => onChange(id)}
        >
          {title}
        </button>
      ))}
    </div>
  );
}
export function Pagination({ items, route, children }) {
  const data = paginate(items, route.params.page);
  return (
    <>
      {children(data.items)}
      {data.pages > 1 && (
        <nav className="pagination" aria-label="分页">
          <button
            className="secondary"
            disabled={data.page === 1}
            onClick={() => patchRoute(route, { page: data.page - 1 })}
          >
            上一页
          </button>
          <span>
            第 {data.page} / {data.pages} 页 · 共 {data.total} 项
          </span>
          <button
            className="secondary"
            disabled={data.page === data.pages}
            onClick={() => patchRoute(route, { page: data.page + 1 })}
          >
            下一页
          </button>
        </nav>
      )}
    </>
  );
}
export function Modal({ title, close, children, wide = false }) {
  const ref = useRef(null),
    closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const previous = document.activeElement,
      old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const root = document.getElementById("page-shell");
    if (root) root.inert = true;
    return () => {
      document.body.style.overflow = old;
      if (root) root.inert = false;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  function keys(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeRef.current();
    }
    if (e.key === "Tab") {
      const els = [
        ...ref.current.querySelectorAll(
          'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length);
      const first = els[0],
        last = els.at(-1);
      if (!first) {
        e.preventDefault();
        return;
      }
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"modal " + (wide ? "wide" : "")}
        onKeyDown={keys}
      >
        <header>
          <h2>{title}</h2>
          <button className="icon-button" onClick={close} aria-label="关闭">
            <Icon name="AddOutlined" className="close-icon" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Actions({ a }) {
  const { state, dispatch, setModal } = useApp();
  return (
    <div className="actions">
      <button
        className={state.likes.includes(a.id) ? "selected" : ""}
        aria-label={"点赞 " + a.title}
        aria-pressed={state.likes.includes(a.id)}
        onClick={() => dispatch({ type: "toggle", key: "likes", id: a.id })}
      >
        <Icon name="ThumbsupOutlined" />
        {a.likes + Number(state.likes.includes(a.id))}
      </button>
      <button
        className={state.bookmarks.includes(a.id) ? "selected" : ""}
        aria-label={"收藏 " + a.title}
        aria-pressed={state.bookmarks.includes(a.id)}
        onClick={() => dispatch({ type: "toggle", key: "bookmarks", id: a.id })}
      >
        <Icon name="CollectionOutlined" />
        {a.saved + Number(state.bookmarks.includes(a.id))}
      </button>
      <button onClick={() => setModal({ type: "share", article: a })}>
        <Icon name="ShareOutlined" />
        分享
      </button>
    </div>
  );
}
export function Tag({ tag }) {
  return (
    <button
      className={
        "tag tag-" +
        (tag === "新人必看"
          ? "yellow"
          : tag === "技巧分享" || tag === "工作提效"
            ? "purple"
            : tag === "案例与作品"
              ? "orange"
              : tag === "MCP"
                ? "blue"
                : "green")
      }
      onClick={() => navigate("search", null, { topic: tag })}
    >
      {tag}
    </button>
  );
}
export function ArticleCard({ a }) {
  const { setModal } = useApp();
  return (
    <article className="article-row">
      <a
        className="cover"
        href={routeUrl("article", a.id)}
        tabIndex={-1}
        aria-hidden="true"
      >
        <img src={cover(a)} alt="" loading="lazy" />
      </a>
      <div className="article-content">
        <h3>
          <a href={routeUrl("article", a.id)}>{a.title}</a>
        </h3>
        <div className="metadata">
          <button
            className="author"
            onClick={() => setModal({ type: "author", author: a.author })}
          >
            <Avatar author={a.author} />
            <span>{creators[a.author]?.name || "社区用户"}</span>
          </button>
          <span className="meta-divider" />
          <span className="date">{a.date}</span>
          <div className="tags">
            {a.tags.map((t) => (
              <Tag tag={t} key={t} />
            ))}
          </div>
        </div>
        <p className="summary">{a.summary}</p>
        <Actions a={a} />
      </div>
    </article>
  );
}
export function Sidebars() {
  const { all, setModal } = useApp();
  return (
    <aside className="sidebar">
      <section className="side-card">
        <h2>社区精华</h2>
        <div className="ranking">
          {all
            .filter((a) => !a.local)
            .slice(0, 5)
            .map((a, i) => (
              <a
                key={a.id}
                href={routeUrl("article", a.id)}
                className="rank-row"
              >
                <span className={"rank rank-" + i}>{i + 1}</span>
                <span className="rank-title">{a.title}</span>
                <Icon name="RightOutlined" />
              </a>
            ))}
        </div>
      </section>
      <section className="side-card creators">
        <h2>金牌创作者</h2>
        {creators.slice(0, 5).map((c, i) => (
          <button
            key={c.name}
            className="creator"
            onClick={() => setModal({ type: "author", author: i })}
          >
            <Avatar author={i} size={32} />
            <span>
              <strong>{c.name}</strong>
              <small>
                收藏量：{c.saved}　获赞：{c.likes}
              </small>
            </span>
          </button>
        ))}
      </section>
    </aside>
  );
}
export class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="not-found">
        <h1>页面遇到了一个问题</h1>
        <p>你的本地数据仍然保留，可以刷新后重试。</p>
        <button className="primary" onClick={() => location.reload()}>
          重新加载
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
