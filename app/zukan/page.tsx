"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ZukanPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
  .from("point_posts")
  .select("*")
  .eq("approved", true);

if (error) {
  console.error(error);
  setLoading(false);
  return;
}

const sorted = (data || []).sort((a: any, b: any) =>
  (a.reading || "").localeCompare(b.reading || "", "ja")
);

setPosts(sorted);
setLoading(false);


      console.log("🔥 posts:", data);
      console.error("🔥 error:", error);

      setPosts(data || []);
      setLoading(false);
    };

    load();
  }, []);

  // 🔥 ダブりまとめ
  const uniquePosts = Object.values(
    posts.reduce((acc: any, post: any) => {
      const key = post.name;

      if (!acc[key]) {
        acc[key] = { ...post, count: 1 };
      } else {
        acc[key].count += 1;
      }

      return acc;
    }, {})
  );

  return (
    <main style={{ padding: 20 }}>
      <h1>ゴミ図鑑</h1>

      <div style={{ marginBottom: 16 }}>
        <Link href="/">← ホーム</Link>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : uniquePosts.length === 0 ? (
        <p>データがありません</p>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {uniquePosts.map((post: any) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 12,
                padding: 12,
                background: "white",
              }}
            >
              {/* 🔥 ここが最重要 */}
              <img
                src={post.image_url}
                alt={post.name}
                style={{
                  width: "100%",
                  maxWidth: 300,
                  borderRadius: 10,
                }}
              />

              <h2>{post.name}</h2>
              <p>よみがな: {post.reading}</p>
              <p>班: {post.team}</p>
              <p>投稿数: {post.count}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}