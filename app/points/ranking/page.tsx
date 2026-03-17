"use client";

import { useEffect, useMemo, useState } from "react";

type PointPost = {
  id: number;
  team: string;
  missionKey: string;
  missionLabel: string;
  quantity: number;
  points: number;
  imageUrl: string;
  approved: boolean;
  rejected?: boolean;
  createdAt: number;
};

type ZukanPost = {
  id: number;
  name: string;
  reading: string;
  approved: boolean;
  points: number;
  entries: {
    team: string;
    imageUrl: string;
    createdAt: number;
  }[];
};

export default function PointRankingPage() {
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);
  const [zukanPosts, setZukanPosts] = useState<ZukanPost[]>([]);

  useEffect(() => {
    fetch("/api/point-posts")
      .then((res) => res.json())
      .then(setPointPosts);

    fetch("/api/posts")
      .then((res) => res.json())
      .then(setZukanPosts);
  }, []);

  const ranking = useMemo(() => {
    const rankingMap: Record<string, number> = {};

    pointPosts
      .filter((p) => p.approved)
      .forEach((p) => {
        rankingMap[p.team] = (rankingMap[p.team] || 0) + p.points;
      });

    zukanPosts
      .filter((p) => p.approved)
      .forEach((p) => {
        const teams = Array.from(new Set(p.entries.map((e) => e.team)));
        teams.forEach((team) => {
          rankingMap[team] = (rankingMap[team] || 0) + (p.points || 0);
        });
      });

    return Object.entries(rankingMap)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);
  }, [pointPosts, zukanPosts]);

  return (
    <main style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>総合ランキング</h1>

      <div style={{ marginBottom: 16 }}>
        <a href="/">← ホームへ戻る</a>
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
                alignItems: "center",
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