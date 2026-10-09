import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';

/** The small floating "copy the code" button over the editor's bottom-right corner (Play, Write & Run and Debug). */
export function CopyCodeButton({ code, isDark }: { code: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy code"
      onClick={async () => {
        if (await copyText(code)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer active:scale-95 transition-colors ${
        isDark ? 'bg-slate-800/90 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-300 text-slate-600'
      }`}
    >
      <span className="material-symbols-outlined !text-[18px]">{copied ? 'check' : 'content_copy'}</span>
    </button>
  );
}
