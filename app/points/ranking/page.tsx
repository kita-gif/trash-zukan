"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PointPost = {
  id: number;
  team: string;
  quantity: number;
  status: string;
};

type ZukanPost = {
  id: number;
  team: string;
  status: string;
};

export default function PointRankingPage() {
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);
  const [zukanPosts, setZukanPosts] = useState<ZukanPost[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: pointData } = await supabase
        .from("point_posts")
        .select("*");

      const { data: zukanData } = await supabase
        .from("posts")
        .select("*");

      setPointPosts(pointData || []);
      setZukanPosts(zukanData || []);
    };

    load();
  }, []);

  const ranking = useMemo(() => {
    const map: Record<string, number> = {};

    // 🔥 ポイント申請
    pointPosts
      .filter((p) => p.status === "approved")
      .forEach((p) => {
        map[p.team] = (map[p.team] || 0) + 5; // 仮：1件5pt
      });

    // 🔥 図鑑投稿
    zukanPosts
      .filter((p) => p.status === "approved")
      .forEach((p) => {
        map[p.team] = (map[p.team] || 0) + 3; // 仮：1件3pt
      });

    return Object.entries(map)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);
  }, [pointPosts, zukanPosts]);

  return (
    <main style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>総合ランキング</h1>

      <div style={{ marginBottom: 16 }}>
        <Link href="/">← ホームへ戻る</Link>
      </div>

      {ranking.length === 0 ? (
        <p>まだポイントがありません</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {ranking.map((item, index) => (
            <div
              key={item.team}
              style={{
                border: "1px solid #ccc",
                borderRadius: 12,
                padding: 14,
                background: "white",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <strong>
                {index + 1}位　{item.team}
              </strong>
              <span>{item.total} pt</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}