"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PASSWORD = "ivusa";

type Post = {
  id: number;
  name: string;
  reading: string;
  team: string;
  image_url: string;
  status: string;
};

export default function AdminPage() {
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") setIsAuthed(true);
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts") // 🔥 修正
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPosts(data || []);
  };

  useEffect(() => {
    if (isAuthed) loadPosts();
  }, [isAuthed]);

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

  const approvePost = async (id: number) => {
    const { error } = await supabase
      .from("posts")
      .update({ status: "approved" }) // 🔥 修正
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("承認失敗");
      return;
    }

    await loadPosts();
    alert("承認しました！");
  };

  // 🔐 ログイン画面
  if (!isAuthed) {
    return (
      <main style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
        <h1>管理者ログイン</h1>

        <div style={{ marginBottom: 16 }}>
          <Link href="/">← 図鑑トップへ戻る</Link>
        </div>

        <input
          type="password"
          placeholder="パスワード"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: 12,
            width: "100%",
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px 20px",
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

  const pending = posts.filter((p) => p.status !== "approved");
  const approved = posts.filter((p) => p.status === "approved");

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>管理者ページ</h1>
        <button onClick={handleLogout}>ログアウト</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Link href="/">← 戻る</Link>
      </div>

      <h2>未承認</h2>

      {pending.map((post) => (
        <div key={post.id} style={{ marginBottom: 20 }}>
          <img
            src={post.image_url}
            style={{ width: 200, borderRadius: 10 }}
          />
          <p>{post.name}</p>
          <p>{post.reading}</p>
          <p>{post.team}</p>

          <button onClick={() => approvePost(post.id)}>
            承認する
          </button>
        </div>
      ))}

      <h2>承認済み</h2>

      {approved.map((post) => (
        <div key={post.id} style={{ marginBottom: 20 }}>
          <img
            src={post.image_url}
            style={{ width: 200, borderRadius: 10 }}
          />
          <p>{post.name}</p>
          <p>{post.reading}</p>
          <p>{post.team}</p>
        </div>
      ))}
    </main>
  );
}