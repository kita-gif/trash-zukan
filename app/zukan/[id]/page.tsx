import { readPosts } from "@/lib/store";
import { getRarity } from "@/lib/rarity";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ZukanDetailPage({ params }: Props) {
  const { id } = await params;

  const posts = readPosts();
  const post = posts.find((p) => String(p.id) === id);

  if (!post) {
    return (
      <main style={{ padding: 20 }}>
        <p>図鑑データが見つかりませんでした。</p>
        <a href="/">図鑑一覧へ戻る</a>
      </main>
    );
  }

  const rarity = getRarity(post.entries.length);
  const uniqueTeams = Array.from(new Set(post.entries.map((e) => e.team)));

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <a href="/">← 図鑑一覧へ戻る</a>
      </div>

      <h1 style={{ marginTop: 0 }}>{post.name}</h1>
      <p>よみがな: {post.reading}</p>
      <p>レア度: {rarity}</p>
      <p>投稿数: {post.entries.length}</p>
      <p>投稿班: {uniqueTeams.join("、")}</p>

      <h2 style={{ marginTop: 28 }}>投稿画像</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {post.entries.map((entry, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <img
              src={entry.imageUrl}
              alt={`${post.name}-${index}`}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: 8, fontSize: 12 }}>
              <p style={{ margin: 0 }}>班: {entry.team}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}