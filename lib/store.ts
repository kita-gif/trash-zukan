import fs from "fs";
import path from "path";

export type TrashEntry = {
  team: string;
  imageUrl: string;
  createdAt: number;
};

export type TrashPost = {
  id: number;
  name: string;
  reading: string;
  approved: boolean;
  points: number;
  entries: TrashEntry[];
};

const FILE = path.join(process.cwd(), "data", "posts.json");

export function readPosts(): TrashPost[] {
  if (!fs.existsSync(FILE)) return [];
  const raw = fs.readFileSync(FILE, "utf-8");
  if (!raw) return [];
  return JSON.parse(raw);
}

export function writePosts(posts: TrashPost[]) {
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2));
}