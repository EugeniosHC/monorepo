// components/debug/QueryDebugger.tsx
"use client";

import { useQueryClient, Query } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { logQueryCacheStatus } from "@/lib/queryDebug";
import { Button } from "@eugenios/ui/components/button";

export default function QueryDebugger() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);

  useEffect(() => {
    if (isOpen) {
      const queryCache = queryClient.getQueryCache();
      setQueries(queryCache.getAll());
    }
  }, [isOpen, queryClient]);

  const handleLogCache = () => {
    logQueryCacheStatus(queryClient);
  };

  const handleRefreshDebugger = () => {
    const queryCache = queryClient.getQueryCache();
    setQueries(queryCache.getAll());
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white">
        Debug Cache
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-96 max-h-[500px] overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h5 className="font-bold">React Query Debug</h5>
        <div className="space-x-2">
          <Button size="sm" onClick={handleRefreshDebugger} variant="outline">
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsOpen(false)} variant="outline">
            Close
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Button size="sm" onClick={handleLogCache} className="w-full" variant="outline">
          Log Cache to Console
        </Button>

        <div className="text-sm text-gray-700">
          <p className="mb-2">Total Queries: {queries.length}</p>

          {queries.map((query, index) => {
            const { queryKey, state } = query;
            return (
              <div key={index} className="mb-4 p-2 border border-gray-200 rounded-md">
                <p className="font-medium">{JSON.stringify(queryKey)}</p>
                <p>
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      state.status === "success"
                        ? "text-green-600"
                        : state.status === "error"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  >
                    {state.status}
                  </span>
                </p>
                <p>Updated: {new Date(state.dataUpdatedAt).toLocaleTimeString()}</p>
                <p>Stale: {query.isStale() ? "Yes" : "No"}</p>
                <p>Fetch Status: {query.state.fetchStatus}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
