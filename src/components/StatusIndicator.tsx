type StatusTone = "neutral" | "active" | "warning" | "error";

const toneStyles: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  active: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning-foreground border-warning/40",
  error: "bg-destructive/10 text-destructive border-destructive/30",
};

const dotStyles: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  active: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
};

export function StatusIndicator({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: StatusTone;
}) {
  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3 ${toneStyles[tone]}`}
    >
      <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${dotStyles[tone]}`} aria-hidden />
      <span className="text-base font-semibold">{label}:</span>
      <span className="text-base">{value}</span>
    </div>
  );
}
