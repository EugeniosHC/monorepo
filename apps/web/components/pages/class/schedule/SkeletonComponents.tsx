// Componente Skeleton para loading
export const SkeletonCard = () => (
  <div className="p-3 border-l-4 border-gray-200 bg-gray-50 animate-pulse rounded">
    <div className="flex justify-between items-start mb-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 w-4 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="w-1 h-2 bg-gray-200 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonMobileCard = () => (
  <div className="p-3 rounded-lg border-l-4 border-gray-200 bg-gray-50 animate-pulse">
    <div className="flex justify-between items-start mb-2">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 w-4 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-1 text-sm">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="w-1 h-2 bg-gray-200 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
