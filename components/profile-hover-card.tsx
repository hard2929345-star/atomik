"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VerifiedBadge } from "@/components/icons";
import { formatCount } from "@/lib/format";
import type { HoverProfile } from "@/lib/profile";

const OPEN_DELAY = 300;
const CLOSE_DELAY = 200;
const CARD_WIDTH = 300;
const MENTION_PATTERN = /(@\w{1,15}|https?:\/\/\S+)/g;

function renderBio(description: string) {
  return description.split(MENTION_PATTERN).map((part, index) =>
    part.startsWith("@") || part.startsWith("http") ? (
      <span key={index} className="text-[#1d9bf0]">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

/** Places the card above the trigger when there is no room below, X-style. */
function position(trigger: DOMRect) {
  const below = window.innerHeight - trigger.bottom;
  const left = Math.min(
    Math.max(8, trigger.left),
    Math.max(8, window.innerWidth - CARD_WIDTH - 8),
  );

  return below > 320
    ? { left, top: trigger.bottom + 6, bottom: undefined }
    : { left, top: undefined, bottom: window.innerHeight - trigger.top + 6 };
}

export function ProfileHoverCard({
  profile,
  children,
  className = "",
}: {
  profile: HoverProfile;
  children: React.ReactNode;
  className?: string;
}) {
  const [placement, setPlacement] = useState<ReturnType<typeof position> | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const rect = anchor.current?.getBoundingClientRect();
      if (rect) setPlacement(position(rect));
    }, OPEN_DELAY);
  };

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlacement(null), CLOSE_DELAY);
  };

  const href = `https://x.com/${profile.username}`;

  return (
    <span
      ref={anchor}
      onMouseEnter={open}
      onMouseLeave={close}
      className={`inline-flex min-w-0 ${className}`}
    >
      {children}

      {placement && typeof document !== "undefined"
        ? createPortal(
            <div
              onMouseEnter={open}
              onMouseLeave={close}
              onClick={(event) => event.stopPropagation()}
              style={{
                left: placement.left,
                top: placement.top,
                bottom: placement.bottom,
                width: CARD_WIDTH,
              }}
              className="fixed z-50 rounded-2xl border border-[#2f3336] bg-black p-4 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            >
              <div className="flex items-start justify-between gap-3">
                <a href={href} target="_blank" rel="noreferrer">
                  {profile.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profilePicture.replace("_normal", "_x96")}
                      alt={profile.name}
                      className="h-16 w-16 rounded-full bg-[#16181c] object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-[#16181c]" />
                  )}
                </a>

                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full bg-[#eff3f4] px-4 py-1.5 text-[14px] font-bold text-black transition-colors hover:bg-[#d7dbdc]"
                >
                  View on X
                </a>
              </div>

              <div className="mt-2 leading-tight">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1"
                >
                  <span className="truncate text-[15px] font-bold text-[#e7e9ea] hover:underline">
                    {profile.name}
                  </span>
                  {profile.verified ? (
                    <VerifiedBadge className="h-[18px] w-[18px] shrink-0 text-[#1d9bf0]" />
                  ) : null}
                </a>
                <p className="truncate text-[15px] text-[#71767b]">@{profile.username}</p>
              </div>

              {profile.description ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-5 text-[#e7e9ea]">
                  {renderBio(profile.description)}
                </p>
              ) : null}

              {profile.following != null || profile.followers != null ? (
                <p className="mt-2 flex gap-4 text-[14px] text-[#71767b]">
                  {profile.following != null ? (
                    <span>
                      <span className="font-bold text-[#e7e9ea]">
                        {formatCount(profile.following)}
                      </span>{" "}
                      Following
                    </span>
                  ) : null}
                  {profile.followers != null ? (
                    <span>
                      <span className="font-bold text-[#e7e9ea]">
                        {formatCount(profile.followers)}
                      </span>{" "}
                      Followers
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
