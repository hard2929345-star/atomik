"use client";

import { useState } from "react";

const TOKEN_PATTERN = /(https?:\/\/\S+|@\w{1,15}|#\w+|\$[A-Za-z]{1,6})/g;

function renderTokens(text: string) {
  return text.split(TOKEN_PATTERN).map((part, index) => {
    if (!part) return null;

    const isLink =
      part.startsWith("http") ||
      part.startsWith("@") ||
      part.startsWith("#") ||
      part.startsWith("$");

    if (!isLink) return <span key={index}>{part}</span>;

    return (
      <span key={index} className="text-[#1d9bf0] hover:underline">
        {part}
      </span>
    );
  });
}

export function TweetText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 380 || text.split("\n").length > 8;
  const shouldClamp = isLong && !expanded;

  return (
    <div className="mt-0.5 text-[15px] leading-5 text-[#e7e9ea]">
      <p className={`whitespace-pre-wrap break-words ${shouldClamp ? "line-clamp-6" : ""}`}>
        {renderTokens(text)}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          className="mt-0.5 text-[15px] text-[#1d9bf0] hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
