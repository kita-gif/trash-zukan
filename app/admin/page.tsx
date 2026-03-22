"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const PASSWORD = "ivusa";

type TrashEntry = {
  team: string;
  imageUrl: string;
  createdAt: number;
};

type TrashPost = {
  id: number;
  name: string;
  reading: string;
  approved: boolean;
  points: number;
  entries: TrashEntry[];
};

type TeamRanking = {
  team: string;
  totalPoints: number;
  approvedCount: number;
};

export default function AdminPage() {
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [posts, setPosts] = useState<TrashPost[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") {
      setIsAuthed(true);
    }
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
  .from("point_posts")
  .select("*")
  .order("created_at", { ascending: false });

if (error) {
  console.error(error);
  return;
}

setPosts(data);
  };

  useEffect(() => {
    if (isAuthed) {
      loadPosts();
    }
  }, [isAuthed]);

  const handleLogin = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthed(true);
    } else {
      alert("パスワードが違います");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthed(false);
    setInput("");
  };

  const approvePost = async (id: number) => {
    const { error } = await supabase
  .from("point_posts")
  .update({
    approved: true,
    points: 5, // 必要なら計算
  })
  .eq("id", id);

if (error) {
  alert("承認に失敗しました");
  console.error(error);
  return;
}

await loadPosts();
alert("承認しました！");

  if (!isAuthed) {
    return (
      <main style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
        <h1>管理者ログイン</h1>

        <div style={{ marginBottom: 16 }}>
          <a href="/">← 図鑑トップへ戻る</a>
        </div>

        <input
          type="password"
          placeholder="パスワード"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: 12,
            width: "100%",
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "#222",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ログイン
        </button>
      </main>
    );
  }
}

  const pendingPosts = posts.filter((post) => !post.approved);
  const approvedPosts = posts.filter((post) => post.approved);

  const rankingMap: Record<string, TeamRanking> = {};

  approvedPosts.forEach((post) => {
    const teamsInThisCard = Array.from(new Set(post.entries.map((e) => e.team)));

    teamsInThisCard.forEach((team) => {
      if (!rankingMap[team]) {
        rankingMap[team] = {
          team,
          totalPoints: 0,
          approvedCount: 0,
        };
      }

      rankingMap[team].totalPoints += post.points;
      rankingMap[team].approvedCount += 1;
    });
  });

  const ranking = Object.values(rankingMap).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>管理者ページ</h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ログアウト
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <a href="/">図鑑トップへ戻る</a>
      </div>

      <h2>班ランキング</h2>

      {ranking.length === 0 ? (
        <p>まだ承認済みの投稿がありません</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
          {ranking.map((item, index) => (
            <div
              key={item.team}
              style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              <strong>
                {index + 1}位　{item.team}
              </strong>
              <p>合計ポイント: {item.totalPoints}</p>
              <p>承認済みカード数: {item.approvedCount}</p>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "32px 0" }} />

      <h2>未承認の投稿</h2>

      {pendingPosts.length === 0 ? (
        <p>未承認の投稿はありません</p>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              <img
                src={post.entries[0]?.imageUrl}
                alt={post.name}
                style={{ width: 220, maxWidth: "100%", borderRadius: 8 }}
              />

              <h3>{post.name}</h3>
              <p>よみがな: {post.reading}</p>
              <p>状態: 未承認</p>
              <p>投稿数: {post.entries.length}</p>
              <p>投稿班: {post.entries.map((e) => e.team).join("、")}</p>

              <button
                onClick={() => approvePost(post.id)}
                style={{
                  padding: "10px 16px",
                  background: "green",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                承認する
              </button>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "32px 0" }} />

      <h2>承認済みの投稿</h2>

      {approvedPosts.length === 0 ? (
        <p>承認済みの投稿はありません</p>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {approvedPosts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              <img
                src={post.entries[0]?.imageUrl}
                alt={post.name}
                style={{ width: 220, maxWidth: "100%", borderRadius: 8 }}
              />

              <h3>{post.name}</h3>
              <p>よみがな: {post.reading}</p>
              <p>状態: 承認済み</p>
              <p>ポイント: {post.points}</p>
              <p>投稿数: {post.entries.length}</p>
              <p>投稿班: {post.entries.map((e) => e.team).join("、")}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}