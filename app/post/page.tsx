"use client";

import { useState } from "react";

export default function PostPage() {
  const [name, setName] = useState("");
  const [reading, setReading] = useState("");
  const [team, setTeam] = useState("1班");
  const [file, setFile] = useState<File | null>(null);

  const teams = ["1班", "2班", "3班"];

  // 🔥 登録処理
  const handleSubmit = async () => {
    if (!file) {
      alert("画像を選択してください");
      return;
    }

    console.log("送信データ", {
      name,
      reading,
      team,
      file,
    });

    alert("送信成功！（まだ仮）");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ゴミを登録</h1>

      {/* 名前 */}
      <input
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      />

      {/* よみがな */}
      <input
        placeholder="よみがな（ひらがな）"
        value={reading}
        onChange={(e) => setReading(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      />

      {/* 班 */}
      <select
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      >
        {teams.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      {/* ファイル */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ display: "block", marginBottom: 10 }}
      />

      {/* 🔥 登録ボタン */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "#ff6a00",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        登録する
      </button>

      {/* 確認表示 */}
      <p>名前: {name}</p>
      <p>よみがな: {reading}</p>
      <p>班: {team}</p>
      <p>ファイル: {file?.name}</p>
    </div>
  );
}