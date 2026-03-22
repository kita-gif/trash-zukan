"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TrashCard from "@/components/TrashCard";
import { getRarity } from "@/lib/rarity";
import { supabase } from "@/lib/supabase";

const kanaList = [
  "あ","い","う","え","お",
  "か","き","く","け","こ",
  "さ","し","す","せ","そ",
  "た","ち","つ","て","と",
  "な","に","ぬ","ね","の",
  "は","ひ","ふ","へ","ほ",
  "ま","み","む","め","も",
  "や","ゆ","よ",
  "ら","り","る","れ","ろ",
  "わ","を","ん"
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("posts") // 🔥 修正
        .select("*")
        .eq("status", "approved") // 🔥 修正
        .order("created_at", { ascending: false });

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
    };

    load();
  }, []);

  const filtered = posts.filter(
    (p) =>
      (p.name || "").includes(search) ||
      (p.reading || "").includes(search)
  );

  const collected = new Set(
    posts.map((p) => p.reading?.[0]).filter(Boolean)
  );

  const completedCount = kanaList.filter((k) => collected.has(k)).length;
  const remaining = kanaList.filter((k) => !collected.has(k));
  const isComplete = completedCount === kanaList.length;
  const progressPercent = (completedCount / kanaList.length) * 100;
  
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
    <main style={{ padding: 16, background: "#f6f8ff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, marginBottom: 12 }}>ゴミ図鑑</h1>

        <input
          placeholder="検索（名前・よみがな）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 14,
            borderRadius: 12,
            border: "1px solid #ccc",
            fontSize: 16,
            boxSizing: "border-box",
            background: "white",
          }}
        />

        {/* 進捗UI（そのまま） */}

        <div style={{ marginBottom: 20 }}>
          <Link
            href="/post"
            style={{
              display: "block",
              textAlign: "center",
              padding: "18px",
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              background: "linear-gradient(135deg, #ff6a00, #ffb703)",
              borderRadius: 18,
              textDecoration: "none",
              boxShadow: "0 12px 28px rgba(255, 122, 0, 0.35)",
              marginBottom: 10,
            }}
          >
            📸 ゴミを登録する
          </Link>

          <Link
            href="/admin"
            style={{
              fontSize: 14,
              color: "#666",
              textDecoration: "none",
            }}
          >
            管理ページ
          </Link>
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p>該当するゴミがありません。</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((post) => {
              const rarity = getRarity(post.quantity || 1);
              return (
                <TrashCard key={post.id} post={post} rarity={rarity} />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}