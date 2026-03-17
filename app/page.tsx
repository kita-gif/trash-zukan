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
        2026年<br/>
        環状線一周清掃<br/>
        点取り合戦🔥🔥
      </h1>

      <div style={{ display: "grid", gap: 16 }}>

        {/* 図鑑 */}
        <a href="/zukan" style={cardStyle("#22c55e")}>
          📘 ゴミ図鑑を見る
        </a>

        {/* 図鑑投稿 */}
        <a href="/post" style={cardStyle("#3b82f6")}>
          📸 図鑑にゴミを登録する
        </a>

        {/* ポイント申請 */}
        <a href="/points/post" style={cardStyle("#f97316")}>
          🏆 ポイント申請
        </a>

         {/* ランキング */}
        <a href="/points/ranking" style={cardStyle("#eab308")}>
          📊 総合ランキング
        </a>

        {/* 管理 */}
        <a href="/points/admin" style={cardStyle("#444")}>
          🔐 管理者ページ
        </a>


      </div>
    </main>
  );
}

// ボタンデザイン
function cardStyle(color: string) {
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
  };
}