import React, { useState } from "react";
import { courses, channels, events, prompts, creators } from "../catalog.js";
import { navigate, patchRoute } from "../core/hooks.js";
import { routeUrl, courseProgress, eventStatus } from "../core/model.js";
import {
  useApp,
  cover,
  Avatar,
  Tabs,
  Empty,
  NotFound,
  ArticleCard,
  Pagination,
  Sidebars,
} from "../components/ui.jsx";
export function CourseCard({ course: c }) {
  const { state } = useApp();
  const progress = courseProgress(c, state.progress[c.id]);
  return (
    <a className="course-card" href={routeUrl("course", c.id)}>
      <img src={cover(c)} alt="" loading="lazy" />
      <div>
        <h3>{c.title}</h3>
        <p>
          <span>
            {c.lessons.length} 节课 · {c.level}
          </span>
          <span>
            {progress.completed
              ? `已完成 ${progress.completed}/${progress.total}`
              : "图文实战"}
          </span>
        </p>
      </div>
    </a>
  );
}
export function Courses({ route }) {
  const level = route.params.level || "all";
  const results = courses.filter((c) => level === "all" || c.level === level);
  return (
    <main className="wide-page shaded">
      <h1 className="section-heading">官方精选</h1>
      <div className="card-grid course-grid">
        {courses
          .filter((c) => c.featured)
          .map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
      </div>
      <h2 className="section-heading spaced">更多推荐</h2>
      <Tabs
        items={["all", "入门", "进阶"].map((x) => [
          x,
          x === "all" ? "全部课程" : x,
        ])}
        value={level}
        onChange={(level) => patchRoute(route, { level, page: 1 })}
      />
      <Pagination items={results} route={route}>
        {(items) => (
          <div className="card-grid course-grid">
            {items.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </Pagination>
    </main>
  );
}
export function Course({ route }) {
  const { state, dispatch } = useApp();
  const c = courses.find((x) => x.id === route.id);
  if (!c) return <NotFound />;
  const p = courseProgress(c, state.progress[c.id]);
  const active = c.lessons.find((l) => l.id === route.params.lesson);
  const next =
    c.lessons.find((l) => !(state.progress[c.id] || []).includes(l.id)) ||
    c.lessons[0];
  const channel = channels.find((x) => x.id === c.channelId);
  return (
    <main className="wide-page shaded">
      <div className="course-hero">
        <img src={cover(c)} alt="" />
        <div>
          <h1>{c.title}</h1>
          <p>{c.summary}</p>
          <span className="tag tag-green">{c.level}</span>
          <div className="course-start">
            <button
              className="primary"
              onClick={() => patchRoute(route, { lesson: next.id })}
            >
              {p.completed === p.total
                ? "重新学习"
                : p.completed
                  ? "继续学习"
                  : "开始学习"}
            </button>
            <span>
              {p.completed === p.total ? "已学完" : "学习进度"} {p.completed}/
              {p.total} 节
            </span>
            <progress value={p.completed} max={p.total} aria-label="学习进度" />
          </div>
        </div>
      </div>
      <div className="course-columns">
        <section className="white-panel lesson-panel">
          <h2>课程目录</h2>
          {c.lessons.map((l, i) => (
            <button
              key={l.id}
              className={"lesson-row " + (active?.id === l.id ? "active" : "")}
              onClick={() => patchRoute(route, { lesson: l.id })}
            >
              <span className="lesson-number">{i + 1}</span>
              <span>
                <strong>{l.title}</strong>
                <small>图文课程 · 约 {l.duration} 分钟</small>
              </span>
              <span>
                {(state.progress[c.id] || []).includes(l.id)
                  ? "已完成"
                  : "开始学习"}
              </span>
            </button>
          ))}
          {active && (
            <article className="lesson-body">
              <span className="eyebrow">本节练习</span>
              <h2>{active.title}</h2>
              <p>{active.body}</p>
              <button
                className="primary"
                onClick={() =>
                  dispatch({
                    type: "lesson",
                    courseId: c.id,
                    lessonId: active.id,
                  })
                }
              >
                {(state.progress[c.id] || []).includes(active.id)
                  ? "撤销完成标记"
                  : "标记本节已完成"}
              </button>
            </article>
          )}
        </section>
        <aside>
          <section className="white-panel">
            <h2>你的学习记录</h2>
            <p className="muted">
              按自己的节奏学习。完成的章节会保存在当前浏览器中。
            </p>
            <a className="text-link" href="#profile?tab=learning">
              查看最近学习
            </a>
          </section>
          <section className="white-panel">
            <h2>所属频道</h2>
            <a href={routeUrl("channel", channel.id)}>
              <img className="panel-cover" src={cover(channel)} alt="" />
              <h3>{channel.name}</h3>
            </a>
            <Subscribe channel={channel} />
          </section>
        </aside>
      </div>
    </main>
  );
}
export function Subscribe({ channel: c }) {
  const { state, dispatch } = useApp();
  const on = state.subscriptions.includes(c.id);
  return (
    <button
      className={"subscribe " + (on ? "selected" : "")}
      aria-pressed={on}
      aria-label={(on ? "取消订阅 " : "订阅 ") + c.name}
      onClick={() =>
        dispatch({ type: "toggle", key: "subscriptions", id: c.id })
      }
    >
      {on ? "已订阅" : "订阅"}
      <span> · {(c.subscribers + Number(on)).toLocaleString()} 人</span>
    </button>
  );
}
export function ChannelCard({ channel: c }) {
  const { all } = useApp();
  const count =
    all.filter((a) => a.channelId === c.id).length +
    courses.filter((a) => a.channelId === c.id).length +
    events.filter((a) => a.channelId === c.id).length;
  return (
    <article className={"channel-card tone-" + c.cover}>
      <div className="channel-art" aria-hidden="true">
        <img src={cover(c)} alt="" />
      </div>
      <div>
        <a href={routeUrl("channel", c.id)}>
          <h2>{c.name}</h2>
          <p>{count} 个内容 · 持续更新</p>
        </a>
        <Subscribe channel={c} />
      </div>
    </article>
  );
}
export function Channels() {
  return (
    <main className="wide-page">
      <section className="channel-banner channel-directory-banner">
        <div>
          <span className="eyebrow">TRAE COMMUNITY</span>
          <h1>找到同路人，让创造继续发生</h1>
          <p>从第一次尝试，到每一个值得分享的作品。</p>
          <a className="primary" href="#channel/makers">
            进入创造者空间站
          </a>
        </div>
        <img src="/assets/cover-build.png" alt="" />
      </section>
      <div className="channel-grid">
        {channels.map((c) => (
          <ChannelCard key={c.id} channel={c} />
        ))}
      </div>
    </main>
  );
}
export function Channel({ route }) {
  const { all, setModal } = useApp();
  const c = channels.find((c) => c.id === route.id);
  if (!c) return <NotFound />;
  const valid = [
    "overview",
    "discussion",
    "courses",
    "articles",
    "works",
    "events",
  ];
  const tab = valid.includes(route.params.tab) ? route.params.tab : "overview";
  const posts = all.filter((a) => a.channelId === c.id),
    cs = courses.filter((x) => x.channelId === c.id),
    es = events.filter((x) => x.channelId === c.id);
  const tabItems = [
    ["overview", "首页"],
    ["discussion", "讨论区"],
    ["courses", "课程"],
    ["articles", "文章"],
    ["works", "作品"],
    ["events", "活动"],
  ];
  let filtered = posts.filter((a) =>
    tab === "discussion"
      ? ["交流", "问答"].includes(a.type)
      : tab === "works"
        ? a.type === "作品"
        : tab === "articles"
          ? ["教程", "公告"].includes(a.type)
          : true,
  );
  return (
    <main className="wide-page shaded">
      <div className="mini-breadcrumb">
        <a href="#channels">频道</a>
        <span>/</span>
        {c.name}
      </div>
      <section className="channel-banner">
        <div>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
          <Subscribe channel={c} />
        </div>
        <img src={cover(c)} alt="" />
      </section>
      <Tabs
        items={tabItems}
        value={tab}
        onChange={(tab) => patchRoute(route, { tab, page: 1 })}
      />
      {tab === "overview" && (
        <>
          <div className="section-title">
            <h2>正在热议</h2>
            <button
              className="text-link"
              onClick={() => patchRoute(route, { tab: "discussion" })}
            >
              更多讨论
            </button>
          </div>
          <DiscussionCards items={posts} />
          <h2 className="section-heading spaced">精选课程</h2>
          <div className="card-grid course-grid">
            {cs.map((x) => (
              <CourseCard key={x.id} course={x} />
            ))}
          </div>
        </>
      )}
      {tab === "courses" ? (
        cs.length ? (
          <div className="card-grid course-grid">
            {cs.map((x) => (
              <CourseCard key={x.id} course={x} />
            ))}
          </div>
        ) : (
          <Empty title="课程正在准备中" />
        )
      ) : tab === "events" ? (
        es.length ? (
          <EventList items={es} />
        ) : (
          <Empty title="暂时没有活动" />
        )
      ) : (
        <section className="white-panel channel-feed">
          {tab === "discussion" && (
            <div className="section-title">
              <h2>全部讨论</h2>
              <button
                className="primary"
                onClick={() =>
                  setModal({
                    type: "compose",
                    channelId: c.id,
                    category: "互动交流",
                  })
                }
              >
                发起讨论
              </button>
            </div>
          )}
          {filtered.length ? (
            <Pagination items={filtered} route={route}>
              {(items) => items.map((a) => <ArticleCard key={a.id} a={a} />)}
            </Pagination>
          ) : (
            <Empty
              title="这里还没有内容"
              action={
                <button
                  className="primary"
                  onClick={() =>
                    setModal({
                      type: "compose",
                      channelId: c.id,
                      category:
                        tab === "works"
                          ? "案例与作品"
                          : tab === "discussion"
                            ? "互动交流"
                            : "技巧分享",
                    })
                  }
                >
                  分享第一篇内容
                </button>
              }
            />
          )}
        </section>
      )}
    </main>
  );
}
export function EventList({ items }) {
  return (
    <div className="event-list">
      {items.map((e) => (
        <article className="event-row" key={e.id}>
          <time>{e.start.slice(0, 10)}</time>
          <a href={routeUrl("event", e.id)}>
            <img src={cover(e)} alt="" />
          </a>
          <div>
            <span className="tag tag-green">
              {
                { ended: "已结束", ongoing: "正在进行", upcoming: "即将开始" }[
                  eventStatus(e)
                ]
              }
            </span>
            <h2>
              <a href={routeUrl("event", e.id)}>{e.title}</a>
            </h2>
            <p className="muted">
              {formatEventTime(e)} · {e.place}
            </p>
            <p>{e.summary}</p>
            <a className="secondary event-link" href={routeUrl("event", e.id)}>
              {eventStatus(e) === "ended" ? "查看回顾" : "查看详情"}
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
const formatEventTime = (e) =>
  `${e.start.slice(0, 10)} ${e.start.slice(11, 16)} — ${e.end.slice(11, 16)}（北京时间）`;
export function Events({ route }) {
  const past = route.params.tab === "past";
  const items = events.filter((e) => (eventStatus(e) === "ended") === past);
  return (
    <main className="wide-page events-page">
      <Tabs
        items={[
          ["current", "当前活动"],
          ["past", "过往活动"],
        ]}
        value={past ? "past" : "current"}
        onChange={(tab) => patchRoute(route, { tab })}
      />
      {items.length ? (
        <EventList items={items} />
      ) : (
        <Empty title="暂时没有活动" />
      )}
    </main>
  );
}
export function Event({ route }) {
  const { state, dispatch, notify, setModal } = useApp();
  const e = events.find((x) => x.id === route.id);
  if (!e) return <NotFound />;
  const ended = eventStatus(e) === "ended",
    registered = state.registrations.includes(e.id);
  return (
    <main className="wide-page">
      <div className="mini-breadcrumb">
        <a href="#events">活动</a>
        <span>/</span>
        {e.title}
      </div>
      <div className="event-detail">
        <img src={cover(e)} alt="" />
        <div>
          <span className="tag tag-green">
            {ended ? "已结束" : registered ? "已预约" : "开放预约"}
          </span>
          <h1>{e.title}</h1>
          <p className="muted">{formatEventTime(e)}</p>
          <p>{e.place}</p>
          <p>{e.summary}</p>
          {ended ? (
            <a className="primary" href={routeUrl("article", e.recap || "7")}>
              阅读活动回顾
            </a>
          ) : (
            <button
              className="primary"
              onClick={() =>
                registered
                  ? setModal({ type: "cancel-registration", event: e })
                  : (dispatch({
                      type: "toggle",
                      key: "registrations",
                      id: e.id,
                    }),
                    notify("预约已记录，可在个人中心查看"))
              }
            >
              {registered ? "取消预约" : "预约活动"}
            </button>
          )}
          <p className="small muted">
            演示活动，预约仅保存在当前浏览器，不会向主办方发送报名。
          </p>
        </div>
      </div>
      <section className="white-panel agenda">
        <h2>活动安排</h2>
        {e.agenda.map((a) => (
          <p key={a}>{a}</p>
        ))}
      </section>
    </main>
  );
}
export function AI({ route }) {
  const { all } = useApp();
  const tab = ["workshop", "prompts", "ideas"].includes(route.params.tab)
    ? route.params.tab
    : "workshop";
  const category = route.params.category || "全部";
  const items = prompts.filter(
    (p) => category === "全部" || p.category === category,
  );
  return (
    <>
      <section className="ai-hero">
        <h1>
          开始你的 <span>AI 创造</span> 之旅
        </h1>
        <p>把好方法变成提示词，把灵感变成下一次行动。</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            navigate("search", null, { q: data.get("q") });
          }}
        >
          <input
            name="q"
            aria-label="搜索 AI 灵感"
            placeholder="你想完成什么？例如：做一个数据看板"
          />
          <button className="primary">寻找灵感</button>
        </form>
      </section>
      <main className="wide-page">
        <Tabs
          items={[
            ["workshop", "AI 工坊"],
            ["prompts", "提示词"],
            ["ideas", "灵感市集"],
          ]}
          value={tab}
          onChange={(tab) => patchRoute(route, { tab, category: "全部" })}
        />
        {tab === "workshop" ? (
          <div className="card-grid prompt-grid">
            {all
              .filter((a) => a.type === "作品")
              .map((a) => (
                <a
                  key={a.id}
                  className="prompt-card"
                  href={routeUrl("article", a.id)}
                >
                  <div className="author">
                    <Avatar author={a.author} />
                    {creators[a.author]?.name}
                  </div>
                  <h2>{a.title}</h2>
                  <img src={cover(a)} alt="" />
                  <span className="text-link">查看作品</span>
                </a>
              ))}
          </div>
        ) : tab === "ideas" ? (
          <section className="channel-feed">
            {all
              .filter(
                (a) =>
                  a.tags.includes("AI充电站") || a.tags.includes("新人必看"),
              )
              .map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
          </section>
        ) : (
          <>
            <Tabs
              items={["全部", "开发助手", "工作提效", "学习成长"].map((x) => [
                x,
                x,
              ])}
              value={category}
              onChange={(category) => patchRoute(route, { category })}
            />
            <div className="card-grid prompt-grid">
              {items.map((p) => (
                <a
                  key={p.id}
                  className="prompt-card"
                  href={routeUrl("prompt", p.id)}
                >
                  <div className="author">
                    <Avatar author={p.author} />
                    {creators[p.author].name}
                  </div>
                  <h2>{p.title}</h2>
                  <img src={cover(p)} alt="" />
                  <span className="text-link">查看提示词</span>
                </a>
              ))}
            </div>
            {!items.length && <Empty />}
          </>
        )}
      </main>
    </>
  );
}
export function Prompt({ route }) {
  const { notify } = useApp();
  const p = prompts.find((p) => p.id === route.id);
  if (!p) return <NotFound />;
  async function copy() {
    try {
      await navigator.clipboard.writeText(p.body);
      notify("提示词已复制");
    } catch {
      notify("请选中下方提示词手动复制");
    }
  }
  return (
    <main className="wide-page narrow-page">
      <div className="mini-breadcrumb">
        <a href="#ai">AI充电站</a>
        <span>/</span>
        {p.category}
      </div>
      <div className="prompt-detail white-panel">
        <img src={cover(p)} alt="" />
        <h1>{p.title}</h1>
        <div className="author">
          <Avatar author={p.author} />
          {creators[p.author].name}
        </div>
        <p className="muted">替换方括号里的内容，再粘贴到 TRAE 开始实践。</p>
        <pre tabIndex={0}>{p.body}</pre>
        <button className="primary" onClick={copy}>
          复制提示词
        </button>
      </div>
    </main>
  );
}
export function DiscussionCards({ items }) {
  return items.length ? (
    <div className="discussion-grid">
      {items.slice(0, 3).map((a) => (
        <a
          href={routeUrl("article", a.id)}
          className="discussion-card"
          key={a.id}
        >
          <div className="author">
            <Avatar author={a.author} />
            {creators[a.author]?.name}
            <span className="muted small">{a.date}</span>
          </div>
          <h3>{a.title}</h3>
          <p>{a.summary}</p>
          <span className="text-link">加入讨论</span>
        </a>
      ))}
    </div>
  ) : (
    <Empty title="等你开启第一场讨论" />
  );
}
export function Home() {
  const { all, state, setModal } = useApp();
  const [feature, setFeature] = useState(0),
    [rotation, setRotation] = useState(0);
  const featured = courses.slice(0, 4),
    active = featured[feature];
  const learned = courses.filter((c) => (state.progress[c.id] || []).length);
  const discussions = [...all.slice(rotation), ...all.slice(0, rotation)];
  return (
    <>
      <section className="home-welcome">
        <div className="welcome-inner">
          <div>
            <h1>Hi TRAE 体验官，创造不停，成长不停！</h1>
            <p>
              {learned.length} 门已学课程　 |　 {state.posts.length} 篇投稿　
              |　 {state.bookmarks.length} 篇收藏
            </p>
            <div>
              <a className="secondary" href="#profile">
                个人中心
              </a>
              <a className="secondary" href="#courses">
                发现更多好课
              </a>
              <a className="secondary" href="#ai">
                探索 AI充电站
              </a>
            </div>
          </div>
          <aside>
            <h3>最近学习</h3>
            {learned[0] ? (
              <a href={routeUrl("course", learned[0].id)}>
                {learned[0].title}
                <p>继续学习 →</p>
              </a>
            ) : (
              <p className="muted">还没有学习记录，选一门课程开始吧。</p>
            )}
          </aside>
        </div>
      </section>
      <main className="wide-page home-content">
        <div className="home-topgrid">
          <div className="home-feature">
            <a href={routeUrl("course", active.id)}>
              <img src={cover(active)} alt="" />
              <div>
                <span>社区精选 · 图文实战</span>
                <h2>{active.title}</h2>
              </div>
            </a>
            <div className="feature-options">
              {featured.map((c, i) => (
                <button
                  className={feature === i ? "active" : ""}
                  key={c.id}
                  onClick={() => setFeature(i)}
                >
                  {c.title}
                </button>
              ))}
              <a className="text-link" href="#courses">
                查看全部课程
              </a>
            </div>
          </div>
          <aside className="home-creator-panel white-panel">
            <h2>热门创作者</h2>
            {creators.slice(0, 4).map((c, i) => (
              <button
                key={c.name}
                className="creator"
                onClick={() => setModal({ type: "author", author: i })}
              >
                <Avatar author={i} size={32} />
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.likes.toLocaleString()} 人点赞</small>
                </span>
              </button>
            ))}
          </aside>
        </div>
        <div className="section-title">
          <h2>
            正在热议 <small>加入对话，碰撞新灵感</small>
          </h2>
          <button
            className="text-link"
            onClick={() => setRotation((rotation + 3) % all.length)}
          >
            换一换
          </button>
        </div>
        <DiscussionCards items={discussions} />
        <div className="section-title">
          <h2>
            推荐好课 <small>懂你所需，学你所想</small>
          </h2>
          <a className="text-link" href="#courses">
            更多课程
          </a>
        </div>
        <div className="card-grid course-grid">
          {featured.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
        <div className="section-title">
          <h2>
            精选频道 <small>订阅你关注的内容</small>
          </h2>
          <a className="text-link" href="#channels">
            更多频道
          </a>
        </div>
        <div className="channel-grid">
          {channels.slice(0, 4).map((c) => (
            <ChannelCard key={c.id} channel={c} />
          ))}
        </div>
        <div className="section-title">
          <h2>创造者的实践</h2>
          <a className="text-link" href="#knowledge">
            查看全部
          </a>
        </div>
        <div className="home-feed">
          <div>
            {all.slice(0, 6).map((a) => (
              <ArticleCard a={a} key={a.id} />
            ))}
          </div>
          <Sidebars />
        </div>
      </main>
    </>
  );
}
