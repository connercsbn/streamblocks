import type { Streamer } from "@prisma/client";
import Image from "next/image";
import { type RouterOutputs } from "../utils/api";
import StreamerInList from "./streamerInList";
import { api } from "../utils/api";
export const Live: React.FC<{
  open: boolean;
}> = ({ open }) => {
  const liveStatuses = api.twitch.getLiveStatus.useQuery();

  function formattedGameName(gameName: string) {
    const maxLength = 20;
    if (gameName.length >= maxLength) {
      const gameNameArray = gameName.split("");
      gameNameArray.splice(maxLength, gameName.length - maxLength, "...");
      gameName = gameNameArray.join("");
    }
    return gameName;
  }

  function formattedViewerCount(number: number): string {
    let formatted: string | string[] = "";
    if (number >= 1000) {
      formatted = (number / 1000).toFixed(1) + "K";
      if (formatted.at(formatted.length - 2) === "0") {
        formatted = formatted.split("");
        formatted.splice(formatted.length - 3, 2);
        formatted = formatted.join("");
      }
    } else {
      formatted = number.toString();
    }
    return formatted;
  }
  return (
    <>
      <div className={`my-2 ${open ? "" : "w-full"}`}>
        {open && <h3 className="p-4 text-lg font-bold text-white">Live</h3>}
        {liveStatuses?.data?.map((status, key) => (
          <div
            key={key}
            className={
              open
                ? "relative flex cursor-default items-center justify-between px-4 py-1.5 align-middle text-white hover:bg-white/10"
                : "relative w-full cursor-default justify-center py-1.5 align-middle text-white hover:bg-white/10"
            }
          >
            {open ? (
              <>
                <div className="flex items-center">
                  <div className="relative mr-3 h-full overflow-hidden rounded-full border-2 border-red-700">
                    <Image
                      width={30}
                      height={30}
                      src={status?.streamer.imageUrl ?? ""}
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="">{status?.streamer.displayName}</div>
                    <div className="text-xs leading-4 text-white/70">
                      {formattedGameName(status?.game_name ?? "")}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex text-xs">
                    <span className="mr-1 inline-block h-2 w-2 self-center rounded-full bg-red-600"></span>
                    {formattedViewerCount(status?.viewer_count ?? 0)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center ">
                  <div className="relative  h-full overflow-hidden rounded-full border-2 border-red-700">
                    <Image
                      width={30}
                      height={30}
                      src={status?.streamer.imageUrl ?? ""}
                      alt=""
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Live;
