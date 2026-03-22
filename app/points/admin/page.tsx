"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PASSWORD = "ivusa";
const HIDE_RANKING = false;

type PointPost = {
  id: number;
  team: string;
  mission_key: string;
  quantity: number;
  image_url: string;
  approved: boolean;
  created_at: string;
};

type ZukanPost = {
  id: number;
  team: string;
  approved: boolean;
};

export default function PointAdminPage() {
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);
  const [zukanPosts, setZukanPosts] = useState<ZukanPost[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("points_admin_auth");
    if (saved === "true") setIsAuthed(true);
  }, []);

  const loadAll = async () => {
    const { data: pointData } = await supabase
      .from("point_posts")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: zukanData } = await supabase
      .from("posts")
      .select("*");

    setPointPosts(pointData || []);
    setZukanPosts(zukanData || []);
  };

  useEffect(() => {
    if (isAuthed) loadAll();
  }, [isAuthed]);

  const handleLogin = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem("points_admin_auth", "true");
      setIsAuthed(true);
    } else {
      alert("パスワードが違います");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("points_admin_auth");
    setIsAuthed(false);
    setInput("");
  };

  const approve = async (id: number) => {
    await supabase
      .from("point_posts")
      .update({ approved: "approved" })
      .eq("id", id);

    await loadAll();
  };

  const reject = async (id: number) => {
    await supabase
      .from("point_posts")
      .update({ approved: "rejected" })
      .eq("id", id);

    await loadAll();
  };

  const pending = pointPosts.filter((p) => !p.approved);
  const approved = pointPosts.filter((p) => p.approved);

  const ranking = useMemo(() => {
    const map: Record<string, number> = {};

    approved.forEach((p) => {
      map[p.team] = (map[p.team] || 0) + 5; // 仮ポイント
    });

    zukanPosts
      .filter((p) => p.approved)
      .forEach((p) => {
        map[p.team] = (map[p.team] || 0) + 3; // 図鑑ポイント
      });

    return Object.entries(map)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);
  }, [approved, zukanPosts]);

  if (!isAuthed) {
    return (
      <main style={{ padding: 20 }}>
        <h1>ポイント管理ログイン</h1>

        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={handleLogin}>ログイン</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>ポイント管理</h1>
        <button onClick={handleLogout}>ログアウト</button>
      </div>

      <Link href="/">← ホーム</Link>

      <h2>ランキング</h2>

      {!HIDE_RANKING &&
        ranking.map((r, i) => (
          <div key={r.team}>
            {i + 1}位 {r.team} {r.total}pt
          </div>
        ))}

      <h2>未承認</h2>

      {pending.map((p) => (
        <div key={p.id}>
          <img src={p.image_url} style={{ width: 150 }} />
          <p>{p.team}</p>

          <button onClick={() => approve(p.id)}>承認</button>
          <button onClick={() => reject(p.id)}>却下</button>
        </div>
      ))}

      <h2>承認済み</h2>

      {approved.map((p) => (
        <div key={p.id}>
          <p>{p.team}</p>
        </div>
      ))}
    </main>
  );
}