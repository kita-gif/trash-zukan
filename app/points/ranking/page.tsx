"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMissionByKey } from "@/lib/pointMissions";

type PointPost = {
  id: number;
  team: string;
  mission_key: string;
  quantity: number;
  status: string;
};

export default function PointRankingPage() {
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);

  // 🔥 データ取得
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("point_posts")
        .select("*");

      console.log("🔥 pointPosts:", data);
      console.error("🔥 error:", error);

      setPointPosts(data || []);
    };

    load();
  }, []);

  // 🔥 ランキング計算
  const ranking = useMemo(() => {
    const map: Record<string, number> = {};

    pointPosts
      .filter((p) => p.status === "approved")
      .forEach((p) => {
        const mission = getMissionByKey(p.mission_key);

        // 🔥 デバッグ（ここが重要）
        console.log("🔥 mission:", p.mission_key, mission);

        const points = (mission?.points ?? 0) * (p.quantity || 1);

        map[p.team] = (map[p.team] || 0) + points;
      });

    return Object.entries(map)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);
  }, [pointPosts]);

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