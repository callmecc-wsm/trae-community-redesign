import React, { useState, useEffect, useRef } from "react";
import { sections } from "../config.js";
import { navigate } from "../core/hooks.js";
import { useApp, Icon } from "./ui.jsx";
export function Header({ route }) {
  const { all, setModal } = useApp();
  const [query, setQuery] = useState(route.params.q || ""),
    [searchOpen, setSearchOpen] = useState(false),
    [mobile, setMobile] = useState(false);
  const root = useRef(null),
    search = useRef(null);
  const active =
    {
      article: "knowledge",
      course: "courses",
      channel: "channels",
      event: "events",
      prompt: "ai",
    }[route.page] || route.page;
  useEffect(() => {
    setQuery(route.params.q || "");
    setSearchOpen(false);
    setMobile(false);
  }, [route.page, route.id, route.params.q]);
  useEffect(() => {
    const close = (e) => {
        if (!root.current?.contains(e.target)) {
          setSearchOpen(false);
          setMobile(false);
        }
      },
      key = (e) => {
        if (e.key === "Escape") {
          setSearchOpen(false);
          setMobile(false);
        }
      };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  const suggestions = all
    .filter((a) =>
      (a.title + a.summary + a.tags.join(""))
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 5);
  function doSearch(e) {
    e?.preventDefault();
    navigate("search", null, { q: query.trim() });
    setSearchOpen(false);
  }
  return (
    <div ref={root} className="header-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="TRAE 中文社区首页">
          <img src="/assets/trae-mark.png" alt="TRAE" />
          <strong>TRAE</strong>
          <span className="brand-divider" />
          <span className="brand-community">社区</span>
        </a>
        <nav className="main-nav" aria-label="主导航">
          {sections
            .filter((s) => s.enabled)
            .map((s) => (
              <button
                key={s.id}
                className={
                  (active === s.id ? "active " : "") +
                  (s.id === "ai" ? "ai-nav" : "")
                }
                aria-current={active === s.id ? "page" : undefined}
                onClick={() => navigate(s.id)}
              >
                {s.label}
              </button>
            ))}
        </nav>
        <div className="header-right">
          <div className={"search-box " + (searchOpen ? "search-open" : "")}>
            <button
              className="mobile-search-button icon-button"
              aria-label="打开搜索"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setTimeout(() => search.current?.focus(), 0);
              }}
            >
              <Icon name="SearchOutlined" />
            </button>
            <form onSubmit={doSearch}>
              <Icon name="SearchOutlined" />
              <input
                ref={search}
                aria-label="搜索社区内容"
                placeholder="请输入关键词"
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
              />
              {query && (
                <button
                  type="button"
                  className="clear-search"
                  aria-label="清空搜索"
                  onClick={() => {
                    setQuery("");
                    search.current?.focus();
                  }}
                >
                  <Icon name="AddOutlined" className="close-icon" />
                </button>
              )}
            </form>
            {searchOpen && query && (
              <div className="search-panel">
                {suggestions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      navigate("article", a.id);
                      setSearchOpen(false);
                    }}
                  >
                    {a.title}
                  </button>
                ))}
                {!suggestions.length && <p>没有匹配的文章，试试搜索其他板块</p>}
                <button className="see-all" onClick={() => doSearch()}>
                  查看全部结果
                  <Icon name="RightSmallCcmOutlined" />
                </button>
              </div>
            )}
          </div>
          <button
            className="user-button"
            aria-label="个人中心"
            onClick={() => navigate("profile")}
          >
            <img src="/assets/trae-mark.png" alt="" />
            <span>TRAE 体验官</span>
          </button>
          <button
            className="mobile-menu-button icon-button"
            aria-label="打开导航"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <Icon name="MenuOutlined" />
          </button>
          <button
            className="primary contribute"
            onClick={() => setModal({ type: "compose" })}
          >
            <Icon name="AddOutlined" />
            投稿
          </button>
        </div>
      </header>
      <nav
        className={"mobile-nav " + (mobile ? "visible" : "")}
        aria-label="移动端导航"
      >
        {[
          ...sections.filter((s) => s.enabled),
          { id: "profile", label: "个人中心" },
        ].map((s) => (
          <button
            key={s.id}
            className={active === s.id ? "active" : ""}
            onClick={() => {
              navigate(s.id);
              setMobile(false);
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
