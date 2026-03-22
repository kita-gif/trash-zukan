import Link from "next/link";
import type { CSSProperties } from "react";

export default function Home() {
  return (
    <main
      style={{
        padding: 20,
        maxWidth: 500,
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>
        ゴミ図鑑 & ポイントサイト
      </h1>

      <div style={{ display: "grid", gap: 16 }}>
        <Link href="/zukan" style={cardStyle("#22c55e")}>
          📘 ゴミ図鑑を見る
        </Link>

        <Link href="/post" style={cardStyle("#3b82f6")}>
          📸 図鑑にゴミを登録する
        </Link>

        <Link href="/points/post" style={cardStyle("#f97316")}>
          🏆 ポイント申請
        </Link>

       <Link href="/admin" style={cardStyle("#444")}>
  🔐 管理画面
</Link>

<Link href="/points/admin" style={cardStyle("#444")}>
  🏆 ポイント管理
</Link>

        <Link href="/points/ranking" style={cardStyle("#eab308")}>
          📊 総合ランキング
        </Link>
      </div>
    </main>
  );
}

function cardStyle(color: string): CSSProperties {
  return {
    display: "block",
    padding: "18px",
    borderRadius: 16,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
    background: color,
    textDecoration: "none",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: "0.2s",
  };
}