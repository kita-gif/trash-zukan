"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  name: string;
  reading: string;
  team: string;
  image_url: string;
  approved: boolean;
};

type PointPost = {
  id: string;
  team: string;
  image_url: string;
  approved: boolean;
  quantity: number;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: pointData } = await supabase
      .from("point_posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(postsData || []);
    setPointPosts(pointData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔥 承認（図鑑）
  const approvePost = async (id: string) => {
    await supabase.from("posts").update({ approved: true }).eq("id", id);
    load();
  };

  // 🔥 承認（ポイント）
  const approvePoint = async (id: string) => {
    await supabase.from("point_posts").update({ approved: true }).eq("id", id);
    load();
  };

  const pendingPosts = posts.filter((p) => !p.approved);
  const approvedPosts = posts.filter((p) => p.approved);

  const pendingPoints = pointPosts.filter((p) => !p.approved);
  const approvedPoints = pointPosts.filter((p) => p.approved);

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>管理画面</h1>

      {loading && <p>読み込み中...</p>}

      {/* 📸 図鑑 未承認 */}
      <h2>未承認（図鑑）</h2>
      {pendingPosts.map((p) => (
        <div key={p.id}>
          <img src={p.image_url} width={200} />
          <p>{p.name}</p>
          <button onClick={() => approvePost(p.id)}>承認</button>
        </div>
      ))}

      {/* 🏆 ポイント 未承認 */}
      <h2>未承認（ポイント）</h2>
      {pendingPoints.map((p) => (
        <div key={p.id}>
          <img src={p.image_url} width={200} />
          <p>{p.team}</p>
          <button onClick={() => approvePoint(p.id)}>承認</button>
        </div>
      ))}

      {/* 📸 図鑑 承認済み */}
      <h2>承認済み（図鑑）</h2>
      {approvedPosts.map((p) => (
        <div key={p.id}>
          <img src={p.image_url} width={200} />
          <p>{p.name}</p>
        </div>
      ))}

      {/* 🏆 ポイント 承認済み */}
      <h2>承認済み（ポイント）</h2>
      {approvedPoints.map((p) => (
        <div key={p.id}>
          <img src={p.image_url} width={200} />
          <p>{p.team}</p>
        </div>
      ))}
    </main>
  );
}