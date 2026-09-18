import React, { useEffect, useRef, useState } from "react";
import { filters } from "../data.js";
import { getFilters } from "../core/model.js";
import { patchRoute } from "../core/hooks.js";
import { Icon } from "./ui.jsx";
export function Filters({ route }) {
  const [menu, setMenu] = useState(null),
    root = useRef(null);
  const selected = getFilters(route.params);
  useEffect(() => {
    const close = (e) => {
        if (!root.current?.contains(e.target)) setMenu(null);
      },
      key = (e) => {
        if (e.key === "Escape") setMenu(null);
      };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  function change(key, v) {
    const arr = selected[key];
    patchRoute(route, {
      [key]: (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]).join(
        ",",
      ),
      page: 1,
    });
  }
  return (
    <div className="filter-bar" ref={root}>
      <div className="filter-track">
        {filters.map((f) => (
          <div className="filter-group" key={f.key}>
            <button
              className={
                "filter-trigger " + (selected[f.key].length ? "chosen" : "")
              }
              aria-expanded={menu === f.key}
              onClick={() => setMenu(menu === f.key ? null : f.key)}
            >
              {f.label}
              <Icon name="DownSmallCcmOutlined" />
              {selected[f.key].length > 0 && (
                <span className="filter-count">{selected[f.key].length}</span>
              )}
            </button>
            {f.suggestions.map((v) => (
              <button
                className={
                  "filter-suggestion " +
                  (selected[f.key].includes(v) ? "chosen" : "")
                }
                key={v}
                onClick={() => change(f.key, v)}
              >
                {v}
              </button>
            ))}
            {menu === f.key && (
              <div
                className="filter-popover"
                role="group"
                aria-label={f.label + "筛选"}
              >
                {f.options.map((v) => (
                  <label key={v}>
                    <input
                      type="checkbox"
                      checked={selected[f.key].includes(v)}
                      onChange={() => change(f.key, v)}
                    />
                    {v}
                  </label>
                ))}
                <button
                  className="filter-reset"
                  onClick={() => patchRoute(route, { [f.key]: "", page: 1 })}
                >
                  重置
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sort-wrap">
        <button
          className="sort-button"
          aria-expanded={menu === "sort"}
          onClick={() => setMenu(menu === "sort" ? null : "sort")}
        >
          <Icon name="SortOutlined" />
          {route.params.sort === "latest" ? "最新" : "最热"}
          <Icon name="DownSmallCcmOutlined" />
        </button>
        {menu === "sort" && (
          <div className="sort-popover">
            {[
              ["popular", "热门"],
              ["latest", "最新"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  patchRoute(route, { sort: id, page: 1 });
                  setMenu(null);
                }}
              >
                按{label}排序
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
