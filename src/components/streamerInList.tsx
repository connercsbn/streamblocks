import { type PropsWithChildren } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { Streamer } from "@prisma/client";
import { useState } from "react";
import { MyButton, MinusButton } from "./buttons";
import Modal from "./modal";
import { type RouterOutputs } from "../utils/api";
import { Menu } from "@headlessui/react";
import { Tooltip } from "react-tooltip";

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
              <span className="ml-2 hidden group-hover:flex group-hover:items-center">
                <>
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
                  <MoreButton hovering={isHovering} />
                </>
              </span>
            </>
          )}
          {top && size === "full" && (
            <span className="relative ml-2 hidden group-hover:inline">
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
              className="ml-2 h-7 w-4"
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
function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>
      <Menu.Items>
        <Menu.Item>
          {({ active }) => (
            <a
              className={`${(active && "bg-blue-500") || ""}`}
              href="/account-settings"
            >
              Account settings
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              className={`${(active && "bg-blue-500") || ""}`}
              href="/account-settings"
            >
              Documentation
            </a>
          )}
        </Menu.Item>
        <Menu.Item disabled>
          <span className="opacity-75">Invite a friend (coming soon!)</span>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
