"use client";

import { useState } from "react";

export default function PostPage() {
  const [name, setName] = useState("");
  const [reading, setReading] = useState("");

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
    </div>
  );
}