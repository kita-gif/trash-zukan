"use client";

import { useState, type CSSProperties } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "../lib/supabase";

// 🔥 ここに置く（超重要）
const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardWrapStyle: CSSProperties = {
  position: "relative",
};

const cardStyle: CSSProperties = {
  width: 260,
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
};

const flashStyle: CSSProperties = {
  position: "absolute",
  width: 80,
  height: 300,
  background: "linear-gradient(to right, transparent, white, transparent)",
};


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

// 🔥 画像選択＋圧縮
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
const selected = e.target.files?.[0];
if (!selected) return;


try {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  };

  const compressedFile: File = await imageCompression(selected, options);

  setFile(compressedFile);
  setPreviewUrl(URL.createObjectURL(compressedFile));
} catch (error) {
  console.error(error);
  setMessage("画像の圧縮に失敗しました");
}

};

// 🔥 投稿処理
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
    setMessage("アップロード中...");

    // 🔥 ファイル名作成
    const fileName = `${Date.now()}-${file.name}`;

    // 🔥 Supabaseにアップロード
    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      setMessage("アップロード失敗: " + error.message);
      setIsSubmitting(false);
      return;
    }

    // 🔥 URL取得
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    setShowEffect(true);
    setMessage("図鑑に登録中...");

    // 🔥 DB保存（今まで通り）
    const postRes = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        reading,
        team,
        imageUrl,
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
}