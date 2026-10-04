import React from 'react';

/** "Leave this task?" bottom sheet, shown when the learner tries to leave a Write & Run / Debug task with unsaved code changes. */
export const LeaveConfirmSheet: React.FC<{
  isDark: boolean;
  onKeepEditing: () => void;
  onLeave: () => void;
}> = ({ isDark, onKeepEditing, onLeave }) => (
  <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-end justify-center animate-fadeIn" onClick={onKeepEditing}>
    <div
      role="dialog"
      aria-label="Leave this task?"
      className={`w-full sm:max-w-[420px] mx-auto rounded-t-2xl border border-b-0 shadow-2xl animate-sheetUp flex flex-col pb-[env(safe-area-inset-bottom,0px)] ${
        isDark ? 'border-slate-700/80 bg-[#121622] text-slate-100' : 'border-slate-300 bg-white text-slate-900'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bottom sheet drag handle */}
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <span className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
      </div>
      <div className="px-5 pt-2 pb-5 flex flex-col gap-3">
        <h2 className="font-['Outfit'] text-lg font-semibold">Leave this task?</h2>
        <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>The code you changed will not be saved.</p>
        <button type="button" onClick={onKeepEditing} className="h-12 rounded-xl bg-indigo-500 text-white font-semibold">
          Keep editing
        </button>
        <button
          type="button"
          onClick={onLeave}
          className={`h-12 rounded-xl font-semibold border ${isDark ? 'border-white/15 text-slate-200' : 'border-slate-300 text-slate-700'}`}
        >
          Leave
        </button>
      </div>
    </div>
  </div>
);
