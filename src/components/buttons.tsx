"use client";
import { type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

const Tooltip = (await import("react-tooltip")).Tooltip;

function PlusButton() {
  return (
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
}
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
function X() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
const MyButton = ({
  onClick,
  children,
  color,
  className,
  hovering,
}: PropsWithChildren<{
  onClick: () => void;
  className?: string;
  color: string;
  hovering?: boolean;
}>) => {
  let colorProperties = "";
  let tooltipContent = "";
  switch (color) {
    case "green":
      colorProperties =
        "hover:border-green-300 hover:bg-green-300/20 hover:border-green-300/40";
      tooltipContent = "Add to favorites";
      break;
    case "yellow":
      colorProperties =
        "hover:border-yellow-300 hover:bg-yellow-300/20 hover:border-yellow-300/40";
      tooltipContent = "Manually input schedule and add to favorites";
      break;
    case "red":
      colorProperties =
        "hover:border-red-300 hover:bg-red-300/20 hover:border-red-300/40";
      tooltipContent = "Remove from favorites";
      break;
  }
  return (
    <>
      <button
        onClick={onClick}
        data-tooltip-id="mytooltip"
        data-tooltip-content={tooltipContent}
        data-tooltip-delay-show={200}
        className={
          "relative z-10 self-end rounded-full border-2 border-transparent bg-slate-700/80 p-1 text-sm font-bold text-white no-underline transition" +
          colorProperties +
          (className ?? "")
        }
      >
        {children}
      </button>
      {hovering &&
        createPortal(
          <Tooltip className="z-50" id="mytooltip" place="right" />,
          document.body
        )}
    </>
  );
};

const MoreButton = ({
  hovering,
}: PropsWithChildren<{ hovering?: boolean }>) => {
  return (
    <>
      <button
        data-tooltip-id="more-button"
        data-tooltip-content="edit stuff about streamer"
        data-tooltip-delay-show={200}
        className={
          "relative z-10 ml-1 h-6 w-5 rounded-md text-gray-300 transition hover:bg-white/10 hover:text-white"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="relative right-[2px] h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      </button>
      {hovering &&
        createPortal(
          <Tooltip className="z-50" id="more-button" place="right" />,
          document.body
        )}
    </>
  );
};

export { PlusButton, MinusButton, X, MyButton, MoreButton };
