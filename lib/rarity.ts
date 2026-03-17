export function getRarity(count: number) {
  if (count >= 20) return "★★★★★";
  if (count >= 10) return "★★★★";
  if (count >= 5) return "★★★";
  if (count >= 2) return "★★";
  return "★";
}