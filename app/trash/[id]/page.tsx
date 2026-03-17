import { getPostById } from "../../lib/store";
import Link from "next/link";

export default async function TrashDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getPostById(Number(id));

  if (!post) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>データが見つかりません</h1>
        <Link href="/">ホームへ戻る</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <img
        src={post.imageUrl}
        alt={post.name}
        style={{
          width: "100%",
          maxHeight: "400px",
          objectFit: "cover",
          borderRadius: "16px",
          marginBottom: "24px",
        }}
      />

      <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>{post.name}</h1>
      <p style={{ marginBottom: "8px" }}>投稿者: {post.groupName}</p>
      <p style={{ marginBottom: "8px" }}>
        状態: {post.approved ? `承認済み（${post.points}pt）` : "未承認"}
      </p>
      <p style={{ marginTop: "24px", lineHeight: 1.8 }}>
        {post.description || "まだ詳細説明は入力されていません。"}
      </p>

      <div style={{ marginTop: "24px" }}>
        <Link href="/" style={{ color: "blue" }}>
          ← ホームへ戻る
        </Link>
      </div>
    </main>
  );
}