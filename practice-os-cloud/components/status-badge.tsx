export function StatusBadge({ value }: { value: string }) {
  const text = value.toLowerCase();
  const level = text.includes("overdue") || text.includes("urgent") || text.includes("correction")
    ? "high"
    : text.includes("review") || text.includes("pending") || text.includes("progress")
      ? "medium"
      : "low";

  return <span className={`badge ${level}`}>{value.replaceAll("_", " ")}</span>;
}
