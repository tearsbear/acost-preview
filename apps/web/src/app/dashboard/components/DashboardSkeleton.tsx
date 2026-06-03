const EASE = "cubic-bezier(0.23,1,0.32,1)";

function stagger(delay: number) {
  return {
    opacity: 0 as const,
    animation: `skFadeInUp 300ms ${EASE} ${delay}ms forwards`,
  };
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-9 w-52 rounded-lg bg-surface animate-pulse" />
          <div className="h-4 w-80 rounded bg-surface animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-md bg-surface animate-pulse" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="fuser-card space-y-3" style={stagger(i * 50)}>
            <div className="flex justify-between items-center">
              <div className="h-2.5 w-20 rounded bg-elevated animate-pulse" />
              <div className="w-8 h-8 rounded-md bg-elevated animate-pulse" />
            </div>
            <div className="h-8 w-28 rounded-md bg-elevated animate-pulse" />
            <div className="h-3 w-32 rounded bg-elevated animate-pulse" />
          </div>
        ))}
      </div>

      {/* AI Intelligence Skeleton */}
      <div className="fuser-card space-y-6" style={stagger(200)}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-elevated animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-elevated animate-pulse" />
              <div className="h-3 w-48 rounded bg-elevated animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-24 rounded bg-elevated animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-elevated animate-pulse" />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          className="fuser-card md:col-span-2 min-h-[340px] space-y-4"
          style={stagger(250)}
        >
          <div className="h-2.5 w-24 rounded bg-elevated animate-pulse" />
          <div className="flex-1 h-[260px] rounded-lg bg-elevated animate-pulse" />
        </div>
        <div
          className="fuser-card md:col-span-1 min-h-[340px] space-y-4"
          style={stagger(300)}
        >
          <div className="h-2.5 w-28 rounded bg-elevated animate-pulse" />
          <div className="flex-1 h-[260px] rounded-lg bg-elevated animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <div className="fuser-card space-y-4" style={stagger(350)}>
        <div className="h-2.5 w-32 rounded bg-elevated animate-pulse" />
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-4 pb-3 border-b border-border">
            {[80, 64, 56, 48, 56, 40].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded bg-elevated animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 py-3 border-b border-border/50"
              style={stagger(400 + i * 40)}
            >
              <div className="h-5 w-20 rounded-full bg-elevated animate-pulse" />
              <div className="h-3 w-20 rounded bg-elevated animate-pulse" />
              <div className="h-3 w-16 rounded bg-elevated animate-pulse" />
              <div className="h-3 w-12 rounded bg-elevated animate-pulse" />
              <div className="h-3 w-14 rounded bg-elevated animate-pulse" />
              <div className="h-3 w-10 rounded bg-elevated animate-pulse" />
            </div>
          ))}
        </div>
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
