import React from "react";
import { useApp, Empty, Tabs, ArticleCard, Avatar } from "../components/ui.jsx";
import { creators, viewer, courses, channels, events } from "../catalog.js";
import { profileTabs } from "../config.js";
import { patchRoute } from "../core/hooks.js";
import { CourseCard, ChannelCard, EventList } from "./Explore.jsx";
import { courseProgress } from "../core/model.js";
export function Profile({ route }) {
  const { state, all, setModal, dispatch } = useApp();
  const tab = profileTabs.some(([id]) => id === route.params.tab)
    ? route.params.tab
    : "learning";
  const learned = courses.filter((c) => (state.progress[c.id] || []).length),
    complete = learned.filter(
      (c) => courseProgress(c, state.progress[c.id]).percent === 100,
    );
  const list =
    tab === "posts"
      ? state.posts
      : all.filter((a) => state.bookmarks.includes(a.id));
  const subscribed = channels.filter((c) => state.subscriptions.includes(c.id)),
    registered = events.filter((e) => state.registrations.includes(e.id));
  return (
    <main className="wide-page profile-layout">
      <aside>
        <section className="white-panel profile-card">
          <Avatar author={viewer} size={112} />
          <h1>TRAE 体验官</h1>
          <p className="muted">把每一次尝试，变成下一次创造的起点。</p>
          <div className="profile-stats">
            <span>
              <strong>{state.posts.length}</strong>投稿
            </span>
            <span>
              <strong>{state.bookmarks.length}</strong>收藏
            </span>
            <span>
              <strong>{learned.length}</strong>已学课程
            </span>
          </div>
        </section>
        <section className="white-panel">
          <h2>学习足迹</h2>
          <p className="muted">
            已完成 {complete.length} 门课程，继续保持你的探索节奏。
          </p>
          <a className="text-link" href="#courses">
            发现下一门好课
          </a>
        </section>
        <section className="white-panel">
          <h2>草稿箱</h2>
          <p className="muted">
            {state.draft.title || state.draft.body
              ? "有一篇尚未发布的草稿"
              : "随时记录你的发现，关闭编辑窗口会保留草稿。"}
          </p>
          <button
            className="text-link"
            onClick={() => setModal({ type: "compose" })}
          >
            {state.draft.title || "开始一篇分享"}
          </button>
        </section>
      </aside>
      <section className="white-panel profile-main">
        <Tabs
          items={profileTabs}
          value={tab}
          onChange={(tab) => patchRoute(route, { tab })}
        />
        {["posts", "bookmarks"].includes(tab) &&
          (list.length ? (
            list.map((a) => <ArticleCard key={a.id} a={a} />)
          ) : (
            <Empty
              title={tab === "posts" ? "还没有投稿作品" : "把好内容留在这里"}
              description={
                tab === "posts"
                  ? "分享你的实践，或继续未完成的草稿。"
                  : "点击内容下方的收藏，就能随时回来查看。"
              }
              action={
                <a className="secondary" href="#knowledge">
                  去社区逛逛
                </a>
              }
            />
          ))}
        {tab === "learning" &&
          (learned.length ? (
            <div className="card-grid course-grid profile-courses">
              {learned.map((c) => (
                <CourseCard course={c} key={c.id} />
              ))}
            </div>
          ) : (
            <Empty
              title="开始你的第一门课程"
              action={
                <a className="primary" href="#courses">
                  发现好课
                </a>
              }
            />
          ))}
        {tab === "subscriptions" &&
          (subscribed.length ? (
            <div className="channel-grid single-column">
              {subscribed.map((c) => (
                <ChannelCard channel={c} key={c.id} />
              ))}
            </div>
          ) : (
            <Empty
              title="订阅你感兴趣的频道"
              action={
                <a className="primary" href="#channels">
                  探索频道
                </a>
              }
            />
          ))}
        {tab === "registrations" &&
          (registered.length ? (
            <EventList items={registered} />
          ) : (
            <Empty
              title="还没有预约活动"
              action={
                <a className="primary" href="#events">
                  查看活动
                </a>
              }
            />
          ))}
        {tab === "following" &&
          (state.following.length ? (
            state.following.map((i) => (
              <div className="follow-row" key={i}>
                <button
                  className="author"
                  onClick={() => setModal({ type: "author", author: i })}
                >
                  <Avatar author={i} size={40} />
                  <span>{creators[i].name}</span>
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    dispatch({ type: "toggle", key: "following", id: i })
                  }
                >
                  取消关注
                </button>
              </div>
            ))
          ) : (
            <Empty
              title="遇见值得关注的创造者"
              description="点击文章作者的头像，查看他们的分享并关注。"
            />
          ))}
      </section>
    </main>
  );
}
