import { type PropsWithChildren } from "react";
import Image from "next/image";
import type { Streamer } from "@prisma/client";
import { useState } from "react";
import Modal from "./modal";

export default function Streamer({
  streamer,
  size,
  top,
  handleToggleFavorite,
  handleToggleCalendar,
}: PropsWithChildren<{
  streamer: Streamer;
  size: "full" | "mini";
  top?: boolean;
  handleToggleFavorite: (streamerId: number) => void;
  handleToggleCalendar?: (streamerId: number) => void;
}>) {
  const [isHovering, setIsHovering] = useState(false);
  const fullClasses = "px-4";
  const miniClasses = "w-full justify-center";
  return (
    <div
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative flex cursor-default ${
        size === "full" ? fullClasses : miniClasses
      } py-1.5 align-middle text-white hover:bg-white/10`}
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
          <Modal streamer={streamer} />
          {!top && isHovering && size === "full" && (
            <></>
            // <span className="relative top-0.5 ml-2">
            //   <MyButton onClick={() => handleToggleFavorite(streamer.id)}>
            //     <PlusButton />
            //   </MyButton>
            // </span>
          )}
          {top && isHovering && size === "full" && (
            <span className="relative top-0.5 ml-2">
              <MyButton onClick={() => handleToggleFavorite(streamer.id)}>
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

const MyButton = ({
  onClick,
  children,
}: PropsWithChildren<{
  onClick: () => void;
  className?: string;
}>) => {
  return (
    <button
      onClick={onClick}
      className="relative top-0 right-2 z-10 self-end rounded-full bg-slate-700/80 p-1 text-sm font-bold text-white no-underline transition hover:bg-slate-500/80"
    >
      {children}
    </button>
  );
};

const MinusButton = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.4}
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
  </svg>
);
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
