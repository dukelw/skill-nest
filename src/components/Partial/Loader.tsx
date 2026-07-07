"use client";

import { Spinner } from "~/components/ui/primitives";

const Loader = () => {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-emerald-100 bg-[#eef7ef]">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-100 bg-[#f7fbf7] px-6 py-5 shadow-sm">
        <Spinner size="xl" aria-label="Loading" />
        <p className="text-sm font-bold text-slate-600">Loading workspace...</p>
      </div>
    </div>
  );
};

export default Loader;
