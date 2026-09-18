import React, { useState } from "react";
import { creators, viewer } from "../catalog.js";
import { navigate, uid } from "../core/hooks.js";
import { routeUrl } from "../core/model.js";
import {
  useApp,
  Icon,
  Avatar,
  Tag,
  Actions,
  NotFound,
} from "../components/ui.jsx";
import { ArticleBody } from "../components/ArticleBody.jsx";
export function Article({ route }) {
  const { all, state, dispatch, setModal, notify } = useApp();
  const current = all.find((a) => a.id === route.id);
  const [comment, setComment] = useState(""),
    [error, setError] = useState("");
  if (!current) return <NotFound />;
  const comments = state.comments[current.id] || [];
  const toc = current.body
    ? [
        ["article-body", "正文"],
        ["section-4", "一起聊聊"],
      ]
    : [
        "开始之前",
        "一个具体的实践",
        "把任务拆小",
        "记录与复用",
        "一起聊聊",
      ].map((x, i) => ["section-" + i, x]);
  function submit(e) {
    e.preventDefault();
    try {
      dispatch({
        type: "comment",
        articleId: current.id,
        id: uid(),
        text: comment,
        date: new Date().toLocaleString("zh-CN"),
      });
      setComment("");
      setError("");
      notify("评论已添加");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <main className="detail-layout">
      <div className="detail-main">
        <div className="breadcrumbs">
          <button onClick={() => navigate("home")}>首页</button>
          <Icon name="RightSmallCcmOutlined" />
          <button
            onClick={() =>
              navigate(current.type === "作品" ? "works" : "knowledge")
            }
          >
            {current.type === "作品" ? "作品" : "知识"}
          </button>
          <Icon name="RightSmallCcmOutlined" />
          <span>{current.title}</span>
        </div>
        <div className="detail-banner">
          <img src="/assets/article-banner.png" alt="" />
        </div>
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="文章目录">
            {toc.map(([id, label]) => (
              <button
                key={id}
                onClick={() =>
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                {label}
              </button>
            ))}
          </nav>
          <article className="reading-content">
            <h1>{current.title}</h1>
            <div className="reading-meta">
              <Avatar author={current.author} />
              {creators[current.author]?.name}
              <span>·</span>
              {current.date}
              <span>·</span>约 5 分钟阅读
            </div>
            <div className="detail-tags">
              {current.tags.map((t) => (
                <Tag tag={t} key={t} />
              ))}
            </div>
            {current.local && (
              <div className="owner-actions">
                <button
                  onClick={() => setModal({ type: "edit", article: current })}
                >
                  编辑投稿
                </button>
                <button
                  onClick={() => setModal({ type: "delete", article: current })}
                >
                  删除投稿
                </button>
                <span>仅在当前浏览器可见</span>
              </div>
            )}
            <p className="lead">{current.summary}</p>
            {current.body ? (
              <p className="user-body" id="article-body">
                {current.body}
              </p>
            ) : (
              <ArticleBody />
            )}
            <div className="mobile-article-actions">
              <Actions a={current} />
            </div>
            <section className="comments" id="section-4">
              <h2>
                一起聊聊 <span>{comments.length}</span>
              </h2>
              <form onSubmit={submit}>
                <textarea
                  maxLength={2000}
                  aria-label="写下你的想法"
                  placeholder="你试过哪些方法？分享一下吧"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                <button className="primary" disabled={!comment.trim()}>
                  发表评论
                </button>
              </form>
              {comments.map((c) => (
                <div className="comment" key={c.id}>
                  <Avatar author={viewer} size={28} />
                  <div>
                    <strong>
                      TRAE 体验官 <small>{c.date}</small>
                    </strong>
                    <p>{c.text}</p>
                    <button
                      className="text-link"
                      aria-label={"删除评论 " + c.text.slice(0, 20)}
                      onClick={() =>
                        dispatch({
                          type: "delete-comment",
                          articleId: current.id,
                          id: c.id,
                        })
                      }
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </article>
        </div>
      </div>
      <aside className="detail-sidebar">
        <Actions a={current} />
        <h2>{current.title}</h2>
        <div className="author">
          <Avatar author={current.author} />
          {creators[current.author]?.name}
        </div>
        <p>{current.summary}</p>
        <button
          className="primary save-large"
          onClick={() =>
            dispatch({ type: "toggle", key: "bookmarks", id: current.id })
          }
        >
          <Icon name="CollectionOutlined" />
          {state.bookmarks.includes(current.id) ? "已收藏" : "收藏"}
        </button>
        <section>
          <h3>更多值得一读</h3>
          {all
            .filter((a) => a.id !== current.id)
            .slice(0, 5)
            .map((a) => (
              <a href={routeUrl("article", a.id)} key={a.id}>
                <Icon name="RightSmallCcmOutlined" />
                {a.title}
              </a>
            ))}
        </section>
      </aside>
    </main>
  );
}
