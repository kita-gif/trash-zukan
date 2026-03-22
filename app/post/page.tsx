"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function PostPage() {
  const [name, setName] = useState("");
  const [reading, setReading] = useState("");
  const [team, setTeam] = useState("1班");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const teams = [
    ...Array.from({ length: 48 }, (_, i) => `${i + 1}班`),
    "その他",
  ];

  const handleSubmit = async () => {
    if (!file || !name || !reading) {
      alert("すべて入力してください");
      return;
    }

    setLoading(true);

    try {
      // ① ファイル名生成
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

const fileName = `${Date.now()}_${Math.random()
  .toString(36)
  .slice(2)}.${fileExt}`;

      // ② Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // ③ 公開URL取得
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // ④ DBに保存（←これが超重要）
      const { error: insertError } = await supabase
        .from("posts")
        .insert([
          {
            name,
            reading,
            team,
            image_url: imageUrl,
            approved: false, // ← 承認フロー用
          },
        ]);

      if (insertError) throw insertError;

      alert("登録完了！");

      // リセット
      setName("");
      setReading("");
      setTeam("1班");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      alert("エラー: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ゴミを登録</h1>

      <input
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      />

      <input
        placeholder="よみがな（ひらがな）"
        value={reading}
        onChange={(e) => setReading(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      />

      <select
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8 }}
      >
        {teams.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: 10 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "#ff6a00",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontWeight: "bold",
          cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "登録中..." : "登録する"}
      </button>

      <hr style={{ margin: "20px 0" }} />

      <p>名前: {name}</p>
      <p>よみがな: {reading}</p>
      <p>班: {team}</p>
      <p>ファイル: {file?.name}</p>
    </div>
  );
}