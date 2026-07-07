import React from "react";

export default function ActionCard({
  title,
  description,
  icon,
  bg,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="group flex min-h-[150px] w-full cursor-pointer flex-col gap-4 rounded-lg border border-emerald-100 bg-[#f7fbf7] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-[#f2fbf4] hover:shadow-md"
      onClick={onClick}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-[17px] font-bold text-slate-950 transition group-hover:text-emerald-800">
          {title}
        </h3>
        <p className="mt-1 text-[15px] text-slate-600">{description}</p>
      </div>
    </button>
  );
}
