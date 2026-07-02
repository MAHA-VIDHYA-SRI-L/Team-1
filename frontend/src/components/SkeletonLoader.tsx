

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-lg w-full"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] overflow-hidden animate-pulse">
      <div className="h-16 bg-slate-100 dark:bg-slate-700/50"></div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-500 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
