"use client";

import { useState } from "react";
import { pointMissions } from "@/lib/pointMissions";

export default function PointPostPage() {
  const [team, setTeam] = useState("1班");
  const [missionKey, setMissionKey] = useState("hirano");
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teams = [
  ...Array.from({ length: 48 }, (_, i) => `${i + 1}班`),
  "その他",
];

  const selectableMissions = pointMissions.filter((m) => !m.adminOnly);
  const currentMission = selectableMissions.find((m) => m.key === missionKey);

  const handleSubmit = async () => {
    if (!currentMission) {
      setMessage("ミッションが見つかりません");
      return;
    }

    if (currentMission.requiresEvidence && !file) {
      setMessage("画像または動画を選択してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      let fileUrl = "";

      if (currentMission.requiresEvidence && file) {
        setMessage("証拠ファイルをアップロード中...");

        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          setMessage("アップロード失敗");
          setIsSubmitting(false);
          return;
        }

        const data = await res.json();
        fileUrl = data.url;
      }

      setMessage("ポイント申請中...");

      const postRes = await fetch("/api/point-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team,
          missionKey: currentMission.key,
          missionLabel: currentMission.label,
          quantity,
          points: currentMission.requiresQuantity
            ? currentMission.points * quantity
            : currentMission.points,
          imageUrl: fileUrl,
        }),
      });

      const postText = await postRes.text();

      if (!postRes.ok) {
        setMessage("申請失敗: " + postText);
        setIsSubmitting(false);
        return;
      }

      setMessage("申請しました！管理者の承認をお待ちください。");
      setFile(null);
      setQuantity(1);
      setIsSubmitting(false);
    } catch (e) {
      console.error(e);
      setMessage("通信エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ padding: 20, maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <a href="/">← ホームへ戻る</a>
      </div>

      <h1>ポイント申請</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
          班
        </label>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            boxSizing: "border-box",
          }}
        >
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
          申請するポイント
        </label>
        <select
          value={missionKey}
          onChange={(e) => {
            setMissionKey(e.target.value);
            setFile(null);
            setQuantity(1);
          }}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            boxSizing: "border-box",
          }}
        >
          {selectableMissions.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}（{m.points}pt{m.requiresQuantity ? " × 数量" : ""}）
            </option>
          ))}
        </select>
      </div>

      {currentMission?.description && (
        <div
          style={{
            background: "#f1f5f9",
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>説明</div>
          <div>📷 {currentMission.description}</div>
        </div>
      )}

      {currentMission && (
        <div
          style={{
            background: "#fff7ed",
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 12,
            border: "1px solid #fed7aa",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>必要な証拠</div>
          {currentMission.requiresEvidence ? (
            <div>
              {currentMission.evidenceType === "video"
                ? "動画を提出してください"
                : "画像を提出してください"}
            </div>
          ) : (
            <div>証拠ファイルは不要です</div>
          )}
        </div>
      )}

      {currentMission?.exampleUrl && (
        <div
          style={{
            background: "#f8fafc",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>例</div>

          {currentMission.evidenceType === "video" ? (
            <video
              src={currentMission.exampleUrl}
              controls
              style={{
                width: "100%",
                borderRadius: 10,
                background: "black",
              }}
            />
          ) : (
            <img
              src={currentMission.exampleUrl}
              alt="例"
              style={{
                width: "100%",
                borderRadius: 10,
                display: "block",
              }}
            />
          )}
        </div>
      )}

      {currentMission?.requiresQuantity && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            数量
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {currentMission?.requiresEvidence && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            証拠ファイル
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      )}

      {!currentMission?.requiresEvidence && (
        <div
          style={{
            background: "#ecfdf5",
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          このミッションは証拠ファイル不要です。
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 14,
          border: "none",
          background: isSubmitting ? "#999" : "#2563eb",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        {isSubmitting ? "申請中..." : "ポイントを申請する"}
      </button>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </main>
  );
}