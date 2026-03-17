"use client";

function getFrameStyle(rarity: string) {
  if (rarity === "★★★★★") {
    return {
      outer: {
        background: "linear-gradient(135deg, #f6d365, #fda085, #fff2a8)",
        boxShadow: "0 0 20px rgba(255, 200, 0, 0.45)",
      },
      badge: {
        background: "#b8860b",
        color: "white",
      },
    };
  }

  if (rarity === "★★★★") {
    return {
      outer: {
        background: "linear-gradient(135deg, #89f7fe, #66a6ff)",
        boxShadow: "0 0 14px rgba(102, 166, 255, 0.35)",
      },
      badge: {
        background: "#2563eb",
        color: "white",
      },
    };
  }

  if (rarity === "★★★") {
    return {
      outer: {
        background: "linear-gradient(135deg, #d4fc79, #96e6a1)",
      },
      badge: {
        background: "#16a34a",
        color: "white",
      },
    };
  }

  if (rarity === "★★") {
    return {
      outer: {
        background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
      },
      badge: {
        background: "#6b7280",
        color: "white",
      },
    };
  }

  return {
    outer: {
      background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
    },
    badge: {
      background: "#9ca3af",
      color: "white",
    },
  };
}

export default function TrashCard({ post, rarity }: any) {
  const thumbnail = post.entries?.[0]?.imageUrl ?? "";
  const count = post.entries?.length ?? 0;
  const frame = getFrameStyle(rarity);

  return (
    <a
      href={`/zukan/${post.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          borderRadius: 18,
          padding: 6,
          ...frame.outer,
          transition: "transform 0.18s ease",
        }}
      >
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            background: "white",
            border: "2px solid rgba(255,255,255,0.9)",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              background: "#f3f4f6",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={post.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : null}

            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                padding: "4px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: "bold",
                ...frame.badge,
              }}
            >
              {rarity}
            </div>
          </div>

          <div style={{ padding: 10 }}>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 4,
                fontWeight: "bold",
              }}
            >
              ゴミ図鑑カード
            </div>

            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: 15,
                lineHeight: 1.3,
              }}
            >
              {post.name}
            </h3>

            <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#666" }}>
              よみ: {post.reading}
            </p>

            <p style={{ margin: 0, fontSize: 12, color: "#444" }}>
              投稿数: {count}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}