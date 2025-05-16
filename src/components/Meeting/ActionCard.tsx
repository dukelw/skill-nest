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
    <div
      className={`p-4 rounded-xl text-white cursor-pointer flex flex-col gap-4 min-h-[140px] ${bg}`}
      onClick={onClick}
    >
      <div className="bg-black/20 rounded-lg w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </div>
  );
}
