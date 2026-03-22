"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getMissionByKey } from "@/lib/pointMissions";

type PointPost = {
  id: number;
  team: string;
  mission_key: string;
  quantity: number;
  approved: boolean;
};

type ZukanPost = {
  id: number;
  team: string;
  approved: boolean;
};

export default function PointRankingPage() {
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);
  const [zukanPosts, setZukanPosts] = useState<ZukanPost[]>([]);

  // 🔥 データ取得
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

  // 🔥 ランキング計算
  const ranking = useMemo(() => {
    const map: Record<string, number> = {};

    // 🏆 ポイント申請
    pointPosts
      .filter((p) => p.approved)
      .forEach((p) => {
        const mission = getMissionByKey(p.mission_key);
        const points = (mission?.points ?? 0) * (p.quantity || 1);

        map[p.team] = (map[p.team] || 0) + points;
      });

    // 📘 図鑑投稿（追加！！）
    zukanPosts
      .filter((p) => p.approved)
      .forEach((p) => {
        map[p.team] = (map[p.team] || 0) + 5; // ←図鑑は5pt
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