import React, { useState } from "react";
import { postCategories, communityConfig } from "../config.js";
import { channels, creators, viewer } from "../catalog.js";
import { validatePost, routeUrl } from "../core/model.js";
import { navigate, uid } from "../core/hooks.js";
import { Modal, Avatar, useApp, cover, Icon } from "./ui.jsx";
export function Composer({ modal, close }) {
  const { state, dispatch, notify } = useApp();
  const edit = modal.type === "edit";
  const [draft, setDraft] = useState(() =>
    edit
      ? {
          title: modal.article.title,
          summary: modal.article.summary,
          body: modal.article.body,
          category: modal.article.tags[0],
          channelId: modal.article.channelId,
          scene: modal.article.scene,
        }
      : {
          ...state.draft,
          ...(modal.category ? { category: modal.category } : {}),
          ...(modal.channelId ? { channelId: modal.channelId } : {}),
        },
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function change(key, value) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (!edit) dispatch({ type: "draft", value: next });
  }
  function submit(e) {
    e.preventDefault();
    if (busy) return;
    const error = validatePost(draft);
    if (error) {
      setError(error);
      return;
    }
    setBusy(true);
    const id = edit ? modal.article.id : uid();
    try {
      dispatch({ type: edit ? "edit" : "publish", draft, id, now: Date.now() });
      close();
      navigate("article", id);
      notify(edit ? "投稿已更新" : "分享已发布到本地演示");
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <Modal title={edit ? "编辑你的分享" : "分享你的发现"} close={close} wide>
      <form className="composer" onSubmit={submit} noValidate>
        <p className="muted">
          好用的技巧、有意思的作品，或一次值得记录的尝试。
        </p>
        <label>
          标题
          <input
            maxLength={communityConfig.maxTitle}
            placeholder="给这次分享起个标题"
            value={draft.title}
            onChange={(e) => change("title", e.target.value)}
          />
        </label>
        <div className="form-columns">
          <label>
            发布到
            <select
              value={draft.category}
              onChange={(e) => change("category", e.target.value)}
            >
              {postCategories.map((x) => (
                <option key={x.label}>{x.label}</option>
              ))}
            </select>
          </label>
          <label>
            所属频道
            <select
              value={draft.channelId}
              onChange={(e) => change("channelId", e.target.value)}
            >
              {channels.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          简介
          <input
            maxLength={160}
            placeholder="用一两句话介绍你的内容"
            value={draft.summary}
            onChange={(e) => change("summary", e.target.value)}
          />
        </label>
        <label>
          正文
          <textarea
            maxLength={communityConfig.maxBody}
            rows={7}
            placeholder="从你想解决的问题开始聊聊吧……"
            value={draft.body}
            onChange={(e) => change("body", e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="composer-bottom">
          <span className="muted small">
            {edit ? "修改后点击保存" : "草稿自动保留"} · 仅当前浏览器可见
          </span>
          <button className="primary" type="submit" disabled={busy}>
            {edit ? "保存修改" : "提交分享"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function Dialogs({ modal, setModal }) {
  const { state, dispatch, all, notify } = useApp();
  if (!modal) return null;
  const close = () => setModal(null);
  if (["compose", "edit"].includes(modal.type))
    return <Composer modal={modal} close={close} />;
  if (modal.type === "share") {
    const a = modal.article;
    const link =
      location.origin + location.pathname + routeUrl("article", a.id);
    return (
      <Modal title="分享这篇内容" close={close}>
        <div className="share-content">
          <img src={cover(a)} alt="" />
          <h3>{a.title}</h3>
          <p className="muted">
            {a.local
              ? "这篇投稿只保存在当前浏览器，其他人打开链接将无法查看。"
              : "把这次发现，分享给一起创造的朋友。"}
          </p>
          <div className="copy-row">
            <input
              aria-label="分享链接"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
            />
            <button
              className="primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  notify("链接已复制");
                } catch {
                  notify("请选中链接手动复制");
                }
              }}
            >
              复制链接
            </button>
          </div>
        </div>
      </Modal>
    );
  }
  if (modal.type === "author") {
    const i = modal.author,
      c = creators[i];
    if (!c) return null;
    return (
      <Modal title="社区创作者" close={close}>
        <div className="profile-top">
          <Avatar author={i} size={64} />
          <h2>{c.name}</h2>
          <p>{c.bio}</p>
          <div className="profile-stats">
            <span>
              <strong>{c.saved}</strong>收藏量
            </span>
            <span>
              <strong>{c.likes}</strong>获赞
            </span>
          </div>
          {i !== viewer && (
            <button
              className={state.following.includes(i) ? "secondary" : "primary"}
              onClick={() =>
                dispatch({ type: "toggle", key: "following", id: i })
              }
            >
              {state.following.includes(i) ? "已关注" : "关注作者"}
            </button>
          )}
        </div>
        <div className="profile-posts">
          <h3>TA 的分享</h3>
          {all
            .filter((a) => a.author === i)
            .map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  close();
                  navigate("article", a.id);
                }}
              >
                {a.title}
                <Icon name="RightSmallCcmOutlined" />
              </button>
            ))}
        </div>
      </Modal>
    );
  }
  if (modal.type === "delete")
    return (
      <Modal title="删除这篇投稿？" close={close}>
        <div className="confirm-body">
          <p>
            「{modal.article.title}
            」及其本地评论将被删除，相关收藏也会移除。此操作无法撤销。
          </p>
          <div>
            <button className="secondary" onClick={close}>
              保留投稿
            </button>
            <button
              className="danger"
              onClick={() => {
                dispatch({ type: "delete", id: modal.article.id });
                close();
                navigate("profile", null, { tab: "posts" });
                notify("投稿已删除");
              }}
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    );
  if (modal.type === "cancel-registration")
    return (
      <Modal title="取消这次预约？" close={close}>
        <div className="confirm-body">
          <p>{modal.event.title}</p>
          <div>
            <button className="secondary" onClick={close}>
              保留预约
            </button>
            <button
              className="primary"
              onClick={() => {
                dispatch({
                  type: "toggle",
                  key: "registrations",
                  id: modal.event.id,
                });
                close();
                notify("预约已取消");
              }}
            >
              确认取消
            </button>
          </div>
        </div>
      </Modal>
    );
  return null;
}
