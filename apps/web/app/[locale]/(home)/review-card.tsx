'use client';

import { useState } from 'react';

export const ReviewCard = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 rounded-xl bg-[#F3F6EC] p-5">
      <span className="inline-block rounded-full bg-[#C7F000] px-3 py-1 text-xs font-semibold">How it works</span>
      <p className="mt-4 text-[15px] font-medium leading-relaxed">
        “Every lesson drops you into a real spreadsheet with one small goal. We check your formula as you type and show you why it
        works, or why it didn’t.”
      </p>
      <p
        className={`relative mt-3 overflow-hidden text-[15px] leading-relaxed transition-[max-height] duration-300 ${
          open ? 'max-h-40 text-[#1F4D3A]/80' : 'max-h-6 text-[#1F4D3A]/60'
        }`}
      >
        <strong className="font-semibold">Short repeats</strong> of what you missed make each skill stick, so you remember it next week.
        {!open && <span className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F3F6EC]" />}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/animateos-logo (6).png" alt="" className="size-12 rounded-full object-cover" />
          <div className="text-[15px] leading-tight">
            <p className="font-semibold">Rajesh Devi</p>
            <p className="mt-0.5 text-[#1F4D3A]/70">Senior VP at J.P Morgan</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="text-[15px] font-semibold text-[#1F4D3A] hover:underline"
        >
          {open ? 'Read Less' : 'Read More'}
        </button>
      </div>
    </div>
  );
};
