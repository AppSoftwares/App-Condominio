import React from 'react'

export const formatLegalBody = (body: string) => {
  return body.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return null;

    if (trimmed.startsWith('•')) {
      return (
        <div key={i} className="flex gap-3 ml-2 mb-4">
          <span className="text-[#0D524D] font-extrabold mt-0.5">•</span>
          <p className="flex-1 text-[#3A3A36] text-justify leading-[1.7]">
            {trimmed.substring(1).trim()}
          </p>
        </div>
      );
    }

    if (/^[0-9]+\./.test(trimmed)) {
      const parts = trimmed.split(' ');
      const number = parts[0];
      const text = parts.slice(1).join(' ');

      return (
        <div key={i} className="pl-6 mb-4 border-l-2 border-[#E4DED0]">
          <p className="font-bold text-[#0D524D] text-[17px] mb-1">{number}</p>
          <p className="text-[#2C2C2A] text-justify leading-[1.7]">{text}</p>
        </div>
      );
    }

    return <p key={i} className="mb-4 text-justify leading-[1.7] text-[#2C2C2A]">{trimmed}</p>;
  }).filter(Boolean);
};
