import React, { useState, useRef, useMemo, useEffect } from "react";
import { articles, courses, channels, events, prompts } from "./catalog.js";
import { sections } from "./config.js";
import { useCommunity, useRoute } from "./core/hooks.js";
import { CommunityContext, ErrorBoundary, NotFound } from "./components/ui.jsx";
import { Header } from "./components/Header.jsx";
import { Dialogs } from "./components/Dialogs.jsx";
import { Feed } from "./pages/Feed.jsx";
import { Article } from "./pages/Article.jsx";
import {
  Home,
  AI,
  Prompt,
  Courses,
  Course,
  Channels,
  Channel,
  Events,
  Event,
} from "./pages/Explore.jsx";
import { Profile } from "./pages/Profile.jsx";
const templates = {
  home: Home,
  ai: AI,
  courses: Courses,
  channels: Channels,
  events: Events,
  feed: Feed,
};
const detailPages = {
  article: Article,
  course: Course,
  channel: Channel,
  event: Event,
  prompt: Prompt,
  profile: Profile,
  search: Feed,
};
export function App() {
  const { state, dispatch, storageStatus } = useCommunity(),
    route = useRoute();
  const [modal, setModal] = useState(null),
    [toast, setToast] = useState("");
  const timer = useRef();
  const all = useMemo(() => [...state.posts, ...articles], [state.posts]);
  const config = sections.find((s) => s.id === route.page && s.enabled);
  const Page =
    detailPages[route.page] || templates[config?.template] || NotFound;
  function notify(message) {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 3000);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    setModal(null);
    const item = {
      article: all,
      course: courses,
      channel: channels,
      event: events,
      prompt: prompts,
    }[route.page]?.find((x) => x.id === route.id);
    document.title =
      (item?.title ||
        item?.name ||
        config?.label ||
        (route.page === "profile"
          ? "个人中心"
          : route.page === "search"
            ? "搜索"
            : "TRAE")) + " · TRAE 社区";
  }, [route.page, route.id, config?.label, all]);
  return (
    <ErrorBoundary key={route.page}>
      <CommunityContext.Provider
        value={{ state, dispatch, storageStatus, all, modal, setModal, notify }}
      >
        <div id="page-shell">
          <a
            className="skip-link"
            href="#main-content"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("main-content")?.focus();
            }}
          >
            跳到主要内容
          </a>
          <Header route={route} />
          {storageStatus === "memory" && (
            <div className="storage-warning" role="alert">
              浏览器暂时无法保存数据。本次操作仍可使用，但刷新后可能丢失，请保留重要内容。
            </div>
          )}
          <div id="main-content" tabIndex={-1}>
            <Page key={route.page + "/" + (route.id || "")} route={route} />
          </div>
          <footer className="site-footer">
            TRAE 社区体验原型 · 内容为演示数据 <span>让每一次创造被看见</span>
          </footer>
        </div>
        <Dialogs modal={modal} setModal={setModal} />
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </CommunityContext.Provider>
    </ErrorBoundary>
  );
}
