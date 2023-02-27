import { type PropsWithChildren } from "react";
import Image from "next/image";
import type { Streamer } from "@prisma/client";
import { useState } from "react";
import { MyButton, MinusButton } from "./buttons";
import Modal from "./modal";
import { type RouterOutputs } from "../utils/api";

export default function Streamer({
  streamer,
  size,
  top,
  handleToggleFavorite,
  handleToggleCalendar,
}: PropsWithChildren<{
  streamer: RouterOutputs["twitch"]["getFollowing"][0];
  size: "full" | "mini";
  top?: boolean;
  handleToggleFavorite: (streamerId: number) => void;
  handleToggleCalendar?: (streamerId: number) => void;
}>) {
  const [isHovering, setIsHovering] = useState(false);
  const fullClasses = "px-4";
  const miniClasses = "w-full justify-center";
  const hasCalendar =
    !!streamer.calendar?.segments.length ||
    !!streamer.calendar?.unofficialSchedule?.unofficialDays.length;
  return (
    <div
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative flex cursor-default ${
        size === "full" ? fullClasses : miniClasses
      } group py-1.5 align-middle text-white hover:bg-white/10`}
    >
      <div
        className={`relative ${
          size === "full" ? "mr-3" : ""
        } h-full overflow-hidden rounded-full`}
      >
        <Image alt="" src={streamer.imageUrl} height={30} width={30} />
      </div>
      {size === "full" && (
        <div className="self-center">{streamer.displayName}</div>
      )}
      <div className="absolute right-4">
        <div className="flex">
          {!top && size === "full" && (
            <>
              {" "}
              <span className="relative top-0.5 ml-2 hidden group-hover:inline">
                {hasCalendar ? (
                  <MyButton
                    color="green"
                    onClick={() => handleToggleFavorite(streamer.id)}
                    hovering={isHovering}
                  >
                    <PlusButton />
                  </MyButton>
                ) : (
                  <Modal
                    streamer={streamer}
                    hovering={isHovering}
                    handleToggleFavorite={handleToggleFavorite}
                  />
                )}
              </span>
            </>
          )}
          {top && size === "full" && (
            <span className="relative top-0.5 ml-2 hidden group-hover:inline">
              <MyButton
                color="red"
                onClick={() => handleToggleFavorite(streamer.id)}
                hovering={isHovering}
              >
                <MinusButton />
              </MyButton>
            </span>
          )}
          {top && size === "full" && handleToggleCalendar && (
            <input
              checked={streamer.isOnCalendar}
              type="checkbox"
              onChange={() => handleToggleCalendar(streamer.id)}
              className="h-7"
            />
          )}
        </div>
      </div>
    </div>
  );
}
const PlusButton = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.4}
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);
