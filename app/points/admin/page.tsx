"use client";

import { useEffect, useMemo, useState } from "react";

const PASSWORD = "ivusa";
const HIDE_RANKING = false; // ← 終盤で true にするとランキング非表示

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

export default function PointAdminPage() {
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [pointPosts, setPointPosts] = useState<PointPost[]>([]);
  const [zukanPosts, setZukanPosts] = useState<ZukanPost[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("points_admin_auth");
    if (saved === "true") {
      setIsAuthed(true);
    }
  }, []);

  const loadAll = async () => {
    const [pointRes, zukanRes] = await Promise.all([
      fetch("/api/point-posts"),
      fetch("/api/posts"),
    ]);

    const pointData = await pointRes.json();
    const zukanData = await zukanRes.json();

    setPointPosts(pointData);
    setZukanPosts(zukanData);
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

  const handleAction = async (id: number, action: string) => {
    const res = await fetch("/api/point-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });

    if (!res.ok) {
      alert("更新に失敗しました");
      return;
    }

    await loadAll();
  };

  const pending = pointPosts.filter((p) => !p.approved && !p.rejected);
  const approved = pointPosts.filter((p) => p.approved);

  const ranking = useMemo(() => {
    const teamPoints: Record<string, number> = {};

    approved.forEach((p) => {
      teamPoints[p.team] = (teamPoints[p.team] || 0) + p.points;
    });

    zukanPosts
      .filter((p) => p.approved)
      .forEach((p) => {
        const teams = Array.from(new Set(p.entries.map((e) => e.team)));
        teams.forEach((team) => {
          teamPoints[team] = (teamPoints[team] || 0) + (p.points || 0);
        });
      });

    return Object.entries(teamPoints)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);
  }, [approved, zukanPosts]);

  if (!isAuthed) {
    return (
      <main style={{ padding: 20, maxWidth: 420, margin: "0 auto" }}>
        <h1>ポイント管理ログイン</h1>

        <input
          type="password"
          placeholder="パスワード"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            marginBottom: 12,
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#222",
            color: "white",
            fontWeight: "bold",
          }}
        >
          ログイン
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>ポイント管理者ページ</h1>
        <button onClick={handleLogout}>ログアウト</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <a href="/">← ホーム</a><br />
        <a href="/points/post">申請ページ</a><br />
        <a href="/points/ranking">ランキング</a>
      </div>

      <h2>ランキング</h2>

      {HIDE_RANKING ? (
        <p>終盤のためランキングは非公開です</p>
      ) : ranking.length === 0 ? (
        <p>まだポイントなし</p>
      ) : (
        <>
          {/* 上位3位 */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {ranking.slice(0, 3).map((item, index) => (
              <div
                key={item.team}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  textAlign: "center",
                  background:
                    index === 0
                      ? "#FFD700"
                      : index === 1
                      ? "#C0C0C0"
                      : "#CD7F32",
                }}
              >
                <div>{index + 1}位</div>
                <div style={{ fontWeight: "bold" }}>{item.team}</div>
                <div>{item.total}pt</div>
              </div>
            ))}
          </div>

          {/* その他 */}
          {ranking.slice(3).map((item, index) => (
            <div key={item.team}>
              {index + 4}位 {item.team} {item.total}pt
            </div>
          ))}
        </>
      )}
            <hr style={{ margin: "32px 0" }} />

      <h2>未承認の申請</h2>

      {pending.length === 0 ? (
        <p>未承認はありません</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {pending.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 12,
                padding: 12,
                background: "white",
              }}
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.missionLabel}
                  style={{ width: 220, maxWidth: "100%", borderRadius: 10 }}
                />
              ) : (
                <p style={{ color: "#666" }}>証拠ファイルなし</p>
              )}

              <h3>{post.missionLabel}</h3>
              <p>班: {post.team}</p>
              <p>ポイント: {post.points}</p>
              {post.quantity > 1 && <p>数量: {post.quantity}</p>}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleAction(post.id, "approve")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "green",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  承認
                </button>

                <button
                  onClick={() => handleAction(post.id, "reject")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#999",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  却下
                </button>

                {post.missionKey === "gomiboke" && (
                  <button
                    onClick={() => handleAction(post.id, "specialApproveGomiboke")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "#f59e0b",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    ゴミボケ20ptで承認
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "32px 0" }} />

      <h2>承認済み</h2>

      {approved.length === 0 ? (
        <p>承認済みはありません</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {approved.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 12,
                padding: 12,
                background: "white",
              }}
            >
              <h3>{post.missionLabel}</h3>
              <p>班: {post.team}</p>
              <p>ポイント: {post.points}</p>
              {post.quantity > 1 && <p>数量: {post.quantity}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}