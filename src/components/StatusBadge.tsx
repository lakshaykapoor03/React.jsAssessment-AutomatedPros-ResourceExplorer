import cls from "./StatusBadge.module.css";

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  const variant =
    normalized === "alive"
      ? "alive"
      : normalized === "dead"
      ? "dead"
      : "unknown";
  return (
    <span className={`${cls.badge} ${cls[variant]}`}>
      {status || "Unknown"}
    </span>
  );
}
