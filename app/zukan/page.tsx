"use client";

import { useEffect, useState } from "react";
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

  // 🔥 Supabaseから取得
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("point_posts")
        .select("*")
        .eq("approved", true)
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

  // 🔍 検索（安全版）
  const filtered = posts.filter(
    (p) =>
      (p.name || "").includes(search) ||
      (p.reading || "").includes(search)
  );

  // 📊 50音進捗
  const collected = new Set(
    posts.map((p) => p.reading?.[0]).filter(Boolean)
  );

  const completedCount = kanaList.filter((k) => collected.has(k)).length;
  const remaining = kanaList.filter((k) => !collected.has(k));
  const isComplete = completedCount === kanaList.length;
  const progressPercent = (completedCount / kanaList.length) * 100;

  return (
    <main style={{ padding: 16, background: "#f6f8ff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, marginBottom: 12 }}>ゴミ図鑑</h1>

        {/* 検索 */}
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

        {/* 進捗 */}
        <div
          style={{
            marginBottom: 14,
            padding: 14,
            background: "white",
            borderRadius: 16,
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            border: "1px solid #ececec",
          }}
        >
          <strong style={{ display: "block", marginBottom: 8 }}>
            50音コンプリート進捗
          </strong>

          <div
            style={{
              height: 14,
              background: "#e5e7eb",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: isComplete
                  ? "linear-gradient(90deg, #ffd700, #ffb300)"
                  : "linear-gradient(90deg, #34d399, #22c55e)",
                borderRadius: 999,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <p style={{ margin: "0 0 6px 0", fontSize: 14 }}>
            {completedCount} / {kanaList.length} 文字
          </p>

          {isComplete ? (
            <p style={{ margin: 0, fontWeight: "bold", color: "#c28a00" }}>
              🎉 50音コンプリート！
            </p>
          ) : (
            <>
              <p style={{ margin: "0 0 6px 0", fontWeight: "bold" }}>
                あと {remaining.length} 文字でコンプリート
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
                未取得：{remaining.join("、")}
              </p>
            </>
          )}
        </div>

        {/* ボタン */}
        <div style={{ marginBottom: 20 }}>
          <a
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
          </a>

          <a
            href="/admin"
            style={{
              fontSize: 14,
              color: "#666",
              textDecoration: "none",
            }}
          >
            管理ページ
          </a>
        </div>

        {/* 一覧 */}
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
                <TrashCard
                  key={post.id}
                  post={post}
                  rarity={rarity}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}