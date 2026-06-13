"use client";

import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

interface Stage {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
}

interface TradeTimelineProps {
  stages: Stage[];
}

export function TradeTimeline({ stages }: TradeTimelineProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border p-6 flex flex-col items-center justify-center min-h-[150px] shadow-[0px_10px_30px_rgba(206,206,206,0.25)] animate-pulse" style={{ borderColor: "var(--border-custom)" }}>
        <Clock className="w-8 h-8 text-gray-300 animate-spin" />
        <span className="text-sm mt-3 text-gray-400">Loading timeline...</span>
      </div>
    );
  }

  // Find the current active stage (the first uncompleted stage, or the last completed one)
  const currentActiveIdx = stages.findIndex((s) => !s.completed);
  const activeIndex = currentActiveIdx === -1 ? stages.length - 1 : currentActiveIdx;

  return (
    <div className="w-full bg-white rounded-2xl border p-6 shadow-[0px_10px_30px_rgba(206,206,206,0.25)]" style={{ borderColor: "var(--border-custom)" }}>
      <h3 className="text-base font-bold text-slate-800 mb-6">Trade Progress Tracker</h3>

      <div className="relative pl-8 space-y-8">
        {/* Continuous line connecting steps */}
        <div 
          className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100"
          style={{ zIndex: 0 }}
        />
        
        {/* Completed line progress indicator */}
        <div 
          className="absolute left-[15px] top-2 w-[2px] bg-emerald-500 transition-all duration-700 ease-in-out"
          style={{ 
            height: `${Math.max(0, (activeIndex / (stages.length - 1)) * 100)}%`,
            maxHeight: "calc(100% - 16px)",
            zIndex: 1 
          }}
        />

        {stages.map((stage, idx) => {
          const isCompleted = stage.completed;
          const isActive = idx === activeIndex && !isCompleted;
          const isFuture = !isCompleted && idx > activeIndex;

          return (
            <div key={stage.key} className="relative flex gap-4 transition-all duration-300" style={{ zIndex: 2 }}>
              {/* Step indicator node */}
              <div className="absolute left-[-25px] top-0.5 shrink-0 bg-white p-0.5">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-100 transition-all scale-100 hover:scale-110">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center text-white shadow-md shadow-yellow-100 animate-pulse transition-all scale-105">
                    <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: "4s" }} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-400">
                    <Circle className="w-3.5 h-3.5 fill-slate-200 stroke-slate-400" />
                  </div>
                )}
              </div>

              {/* Step contents */}
              <div className={`flex-1 pl-4 ${isFuture ? "opacity-50" : "opacity-100"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className={`text-sm font-bold transition-colors ${
                    isCompleted ? "text-emerald-700" : isActive ? "text-[#C9A227]" : "text-slate-800"
                  }`}>
                    {stage.label}
                  </h4>
                  
                  {isCompleted && stage.completedAt && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {new Date(stage.completedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
