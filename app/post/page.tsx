"use client";

import { useState } from "react";

export default function PostPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [reading, setReading] = useState("");
  const [team, setTeam] = useState("1班");
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [showEffect, setShowEffect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teams = [
    ...Array.from({ length: 48 }, (_, i) => `${i + 1}班`),
    "その他",
  ];

  const isHiragana = (text: string) => /^[ぁ-んー]+$/.test(text);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("画像を選択してください");
      return;
    }

    if (!name.trim()) {
      setMessage("ゴミの名前を入力してください");
      return;
    }

    if (!reading.trim()) {
      setMessage("よみがなを入力してください");
      return;
    }

    if (!isHiragana(reading.trim())) {
      setMessage("よみがなはひらがなで入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("画像をアップロード中...");

      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const uploadText = await uploadRes.text();

      if (!uploadRes.ok) {
        setMessage("アップロード失敗: " + uploadText);
        setIsSubmitting(false);
        return;
      }

      const uploadData = JSON.parse(uploadText);

      setShowEffect(true);
      setMessage("図鑑に登録中...");

      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          reading,
          team,
          imageUrl: uploadData.url,
        }),
      });

      const postText = await postRes.text();

      if (!postRes.ok) {
        setShowEffect(false);
        setMessage("投稿登録失敗: " + postText);
        setIsSubmitting(false);
        return;
      }

      const result = JSON.parse(postText);

      setTimeout(() => {
  setShowEffect(false);

  if (result.mode === "merged") {
    setMessage("既存カードに追加しました");
  } else {
    setMessage("新しいカードとして登録しました");
  }

  setFile(null);
  setName("");
  setReading("");
  setTeam("1班");
  setPreviewUrl("");
  setIsSubmitting(false);

  window.location.href = "/";
}, 1400);
    } catch (error) {
      console.error(error);
      setMessage("通信エラーが発生しました");
      setIsSubmitting(false);
      setShowEffect(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <a href="/">← 図鑑に戻る</a>

      <h1>ゴミを登録</h1>

      <input
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="よみがな（ひらがな）"
        value={reading}
        onChange={(e) => setReading(e.target.value)}
      />

      <select value={team} onChange={(e) => setTeam(e.target.value)}>
        {teams.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <input type="file" onChange={handleFileChange} />

      {previewUrl && <img src={previewUrl} width={200} />}
<button
  onClick={handleSubmit}
  disabled={isSubmitting}
  style={{
    width: "100%",
    padding: "20px 16px",
    background: isSubmitting
      ? "#9aa0a6"
      : "linear-gradient(135deg, #ff6a00, #ffb703)",
    color: "white",
    border: "none",
    borderRadius: 18,
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: isSubmitting
      ? "none"
      : "0 14px 28px rgba(255, 122, 0, 0.35)",
    letterSpacing: "0.04em",
  }}
>
  {isSubmitting ? "登録中..." : "📸 図鑑に登録する"}
</button>

      <p>{message}</p>
            {showEffect && (
        <div style={overlayStyle}>
          <div style={cardWrapStyle}>
            <div style={flashStyle} />
            <div style={cardStyle}>
              {previewUrl && (
                <img
                  src={previewUrl}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                  }}
                />
              )}

              <div style={{ padding: 10 }}>
                <h2>{name}</h2>
                <p>{team}</p>
                <p>{reading}</p>
                <p>NEW</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardWrapStyle = {
  animation: "pop 1s ease forwards",
};

const cardStyle = {
  width: 260,
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
};

const flashStyle = {
  position: "absolute",
  width: 80,
  height: 300,
  background:
    "linear-gradient(to right, transparent, white, transparent)",
  animation: "flash 1s",
};