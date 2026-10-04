import React from 'react';
import { X, Filter, Check } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  groups: FilterGroup[];
  onReset?: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  title,
  groups,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {groups.map((group) => (
              <div key={group.id} className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.options.map((opt) => {
                    const isSelected = group.selectedValue === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => group.onChange(opt.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white dark:bg-blue-600 shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {opt.count !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2">
            {onReset && (
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Reset All
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
