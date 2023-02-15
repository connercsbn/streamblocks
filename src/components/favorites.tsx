import type { Streamer } from "@prisma/client";
import Image from "next/image";
import Draggable from "react-draggable";
import { type RouterOutputs } from "../utils/api";
import StreamerInList from "./streamerInList";
export const TopEight: React.FC<{
  big: boolean;
  following: RouterOutputs["twitch"]["getFollowing"];
  handleToggleFavorite: (streamerId: number) => void;
  handleToggleCalendar: (streamerId: number) => void;
}> = ({ big, handleToggleFavorite, handleToggleCalendar, following }) => {
  const favorites = following?.filter((streamer) => streamer.isFavorite);
  if (!favorites) {
    return <></>;
  }
  return (
    <>
      <div className={`my-2 ${big ? "" : "w-full"}`}>
        {favorites.map((streamer, key) => (
          <StreamerInList
            key={key}
            size={big ? "full" : "mini"}
            streamer={streamer}
            handleToggleFavorite={handleToggleFavorite}
            handleToggleCalendar={handleToggleCalendar}
            top={true}
          />
        ))}
      </div>
    </>
  );
};

export default TopEight;
