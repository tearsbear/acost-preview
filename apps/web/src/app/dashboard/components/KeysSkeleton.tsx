const EASE = "cubic-bezier(0.23,1,0.32,1)";

function stagger(delay: number) {
  return {
    opacity: 0 as const,
    animation: `skFadeInUp 300ms ${EASE} ${delay}ms forwards`,
  };
}

export function KeysSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-lg bg-surface animate-pulse" />
          <div className="h-4 w-80 rounded bg-surface animate-pulse" />
        </div>
        <div className="h-9 w-36 rounded-md bg-surface animate-pulse" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="fuser-card space-y-3" style={stagger(i * 50)}>
            <div className="flex justify-between items-center">
              <div className="h-2.5 w-24 rounded bg-elevated animate-pulse" />
              <div className="w-7 h-7 rounded-md bg-elevated animate-pulse" />
            </div>
            <div className="h-7 w-16 rounded-md bg-elevated animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-elevated animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="fuser-card" style={stagger(200)}>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-10 rounded-md bg-elevated animate-pulse" />
          <div className="h-10 w-28 rounded-md bg-elevated animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <div className="fuser-card space-y-4" style={stagger(260)}>
        <div className="h-2.5 w-20 rounded bg-elevated animate-pulse" />
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border">
          {[96, 112, 80, 80, 64].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded bg-elevated animate-pulse"
              style={{ width: w, maxWidth: "100%" }}
            />
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 py-3 border-b border-border/50"
            style={stagger(310 + i * 40)}
          >
            <div className="h-4 w-28 rounded bg-elevated animate-pulse" />
            <div className="h-4 w-32 rounded bg-elevated animate-pulse" />
            <div className="h-4 w-20 rounded bg-elevated animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-elevated animate-pulse" />
            <div className="h-7 w-7 rounded-md bg-elevated animate-pulse ml-auto" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skFadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
