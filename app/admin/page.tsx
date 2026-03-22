"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PASSWORD = "ivusa";

type Post = {
  id: string;
  team: string;
  image_url: string;
  approved: boolean;
  quantity: number;
  created_at: string;
};

export default function AdminPage() {
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 ログイン状態保持
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") setIsAuthed(true);
  }, []);

  // 📦 データ取得（Supabase）
  const loadPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("point_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthed) loadPosts();
  }, [isAuthed]);

  // 🔑 ログイン処理
  const handleLogin = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthed(true);
    } else {
      alert("パスワードが違います");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthed(false);
    setInput("");
  };

  // ✅ 承認処理
  const approvePost = async (post: Post) => {
    const { error } = await supabase
      .from("point_posts")
      .update({ approved: true })
      .eq("id", post.id);

    if (error) {
      console.error(error);
      alert("承認失敗");
      return;
    }

    alert("承認しました！");
    await loadPosts();
  };

  // 🔍 未承認だけ抽出
  const pending = posts.filter((p) => !p.approved);
  const approved = posts.filter((p) => p.approved);

  // 🔐 ログイン画面
  if (!isAuthed) {
    return (
      <main style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
        <h1>管理者ログイン</h1>

        <input
          type="password"
          placeholder="パスワード"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "#222",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "bold",
          }}
        >
          ログイン
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1>管理画面</h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 12px",
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          ログアウト
        </button>
      </div>

      <Link href="/">← ホームへ戻る</Link>

      {/* 未承認 */}
      <h2 style={{ marginTop: 20 }}>未承認</h2>

      {loading ? (
        <p>読み込み中...</p>
      ) : pending.length === 0 ? (
        <p>未承認はありません</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {pending.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
                background: "white",
              }}
            >
              <img
                src={post.image_url}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />

              <p>班：{post.team}</p>

              <button
                onClick={() => approvePost(post)}
                style={{
                  width: "100%",
                  padding: 12,
                  background: "green",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: "bold",
                }}
              >
                承認する
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 承認済み */}
      <h2 style={{ marginTop: 30 }}>承認済み</h2>

      {approved.length === 0 ? (
        <p>まだありません</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {approved.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
                background: "#f9fafb",
              }}
            >
              <img
                src={post.image_url}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />

              <p>班：{post.team}</p>
              <p style={{ color: "green", fontWeight: "bold" }}>承認済み</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}