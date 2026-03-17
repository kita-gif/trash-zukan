import { NextRequest, NextResponse } from "next/server";
import { readPosts, writePosts } from "@/lib/store";

function normalizeReading(reading: string) {
  return reading.trim();
}

export async function GET() {
  return NextResponse.json(readPosts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const posts = readPosts();

  const normalizedReading = normalizeReading(String(body.reading));

  const existing = posts.find(
    (p) => normalizeReading(p.reading) === normalizedReading
  );

  if (existing) {
    existing.entries.push({
      team: body.team,
      imageUrl: body.imageUrl,
      createdAt: Date.now(),
    });

    writePosts(posts);

    return NextResponse.json({
      ok: true,
      mode: "merged",
      post: existing,
    });
  }

  const newPost = {
    id: Date.now(),
    name: String(body.name).trim(),
    reading: normalizedReading,
    approved: false,
    points: 0,
    entries: [
      {
        team: body.team,
        imageUrl: body.imageUrl,
        createdAt: Date.now(),
      },
    ],
  };

  posts.push(newPost);
  writePosts(posts);

  return NextResponse.json({
    ok: true,
    mode: "new",
    post: newPost,
  });
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();

  const posts = readPosts();

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  post.approved = true;
  post.points = 5;

  writePosts(posts);

  return NextResponse.json({ ok: true, points: 5 });
}