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
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

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

  // 🔥 承認 + ポイント付与
  const approvePost = async (post: Post) => {
    // ① 図鑑承認
    const { error } = await supabase
      .from("posts")
      .update({ status: "approved" })
      .eq("id", post.id);

    if (error) {
      alert("承認失敗");
      return;
    }

    // ② ポイント追加（ここが超重要）
    await supabase.from("point_posts").insert([
      {
        team: post.team,
        mission_key: "zukan",
        quantity: 1,
        status: "approved",
      },
    ]);

    alert("承認＆5pt付与！");
    await loadPosts();
  };

  if (!isAuthed) {
    return (
      <main style={{ padding: 20 }}>
        <h1>管理者ログイン</h1>

        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={handleLogin}>ログイン</button>
      </main>
    );
  }

  const pending = posts.filter((p) => p.status !== "approved");

  return (
    <main style={{ padding: 20 }}>
      <h1>図鑑管理</h1>

      <Link href="/">← ホーム</Link>

      <h2>未承認</h2>

      {pending.map((post) => (
        <div key={post.id} style={{ marginBottom: 20 }}>
          <img src={post.image_url} style={{ width: 200 }} />
          <p>{post.name}</p>

          <button onClick={() => approvePost(post)}>
            承認（+5pt）
          </button>
        </div>
      ))}
    </main>
  );
}