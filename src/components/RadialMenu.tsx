import type { CommunicationOption } from "../lib/communication";

/**
 * Radial-style communication menu.
 * Options are arranged around a circular ring; the centre shows the
 * currently focused option. Selection is driven by the parent (dwell /
 * gesture logic later), so this component stays purely presentational.
 */
export function RadialMenu({
  options,
  selectedId,
  onSelect,
  onConfirm,
}: {
  options: CommunicationOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: (id: string) => void;
}) {
  const radius = 38; // percent of container
  const selected = options.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      {/* Centre readout */}
      <div className="absolute inset-[30%] flex items-center justify-center rounded-full border-2 border-border bg-card text-center shadow-sm">
        {selected ? (
          <button
            onClick={() => onConfirm(selected.id)}
            className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-full px-4"
            aria-label={`Confirm ${selected.label}`}
          >
            <span className="text-2xl font-bold leading-tight">{selected.label}</span>
            <span className="text-sm font-medium text-muted-foreground">Tap to confirm</span>
          </button>
        ) : (
          <p className="px-6 text-lg font-medium text-muted-foreground">
            Select an option
          </p>
        )}
      </div>

      {/* Ring options */}
      {options.map((opt, i) => {
        const angle = (i / options.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            onDoubleClick={() => onConfirm(opt.id)}
            aria-pressed={isSelected}
            className={`absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 px-2 text-center text-sm font-bold leading-tight shadow-sm transition-colors md:h-24 md:w-24 md:text-base ${
              isSelected
                ? opt.urgent
                  ? "border-urgent bg-urgent text-urgent-foreground"
                  : "border-primary bg-primary text-primary-foreground"
                : opt.urgent
                  ? "border-urgent/40 bg-card text-urgent hover:bg-urgent/10"
                  : "border-border bg-card text-foreground hover:bg-accent"
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
