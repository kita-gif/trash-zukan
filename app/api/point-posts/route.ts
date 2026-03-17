import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getMissionByKey } from "@/lib/pointMissions";

const FILE = path.join(process.cwd(), "data", "point-posts.json");

function readPointPosts() {
  if (!fs.existsSync(FILE)) return [];
  const raw = fs.readFileSync(FILE, "utf-8");
  if (!raw) return [];
  return JSON.parse(raw);
}

function writePointPosts(posts: any[]) {
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2));
}

export async function GET() {
  return NextResponse.json(readPointPosts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const mission = getMissionByKey(body.missionKey);

  if (!mission) {
    return NextResponse.json({ error: "mission not found" }, { status: 400 });
  }

  if (mission.adminOnly) {
    return NextResponse.json({ error: "admin only mission" }, { status: 403 });
  }

  const quantity = mission.requiresQuantity
    ? Math.max(1, Number(body.quantity || 1))
    : 1;

  const points = mission.points * quantity;

  const posts = readPointPosts();

  const newPost = {
    id: Date.now(),
    team: body.team,
    missionKey: mission.key,
    missionLabel: mission.label,
    quantity,
    points,
    imageUrl: body.imageUrl,
    approved: false,
    rejected: false,
    createdAt: Date.now(),
  };

  posts.push(newPost);
  writePointPosts(posts);

  return NextResponse.json({ ok: true, post: newPost });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const posts = readPointPosts();

  const post = posts.find((p: any) => p.id === body.id);

  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (body.action === "approve") {
    post.approved = true;
    post.rejected = false;
  }

  if (body.action === "reject") {
    post.rejected = true;
    post.approved = false;
  }

  if (body.action === "specialApproveGomiboke") {
    post.approved = true;
    post.rejected = false;
    post.points = 20;
    post.missionLabel = "ゴミボケ（20pt）";
    post.missionKey = "gomibokeSpecial";
  }

  writePointPosts(posts);

  return NextResponse.json({ ok: true });
}