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

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("point_posts")
        .select("*");

      setPointPosts(data || []);
    };

    load();
  }, []);

  const ranking = useMemo(() => {
    const map: Record<string, number> = {};

    pointPosts
      .filter((p) => p.status === "approved")
      .forEach((p) => {
        const mission = getMissionByKey(p.mission_key);

        const points = (mission?.points ?? 0) * (p.quantity || 1);

        map[p.team] = (map[p.team] || 0) + points;
      });

    return Object.entries(map)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);
  }, [pointPosts]);

  return (
    <main style={{ padding: 20 }}>
      <h1>総合ランキング</h1>

      <Link href="/">← ホーム</Link>

      {ranking.map((r, i) => (
        <div key={r.team}>
          {i + 1}位 {r.team} {r.total}pt
        </div>
      ))}
    </main>
  );
}