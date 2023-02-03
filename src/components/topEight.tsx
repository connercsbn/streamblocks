import type { Streamer } from "@prisma/client";
import Image from "next/image";
import Draggable from "react-draggable";
import StreamerInList from "./streamerInList";
export const TopEight: React.FC<{
  topEight?: Streamer[];
}> = ({ topEight }) => {
  if (!topEight?.length) {
    return <></>;
  }
  return (
    <>
      <div className="mb-4">
        {topEight.map((streamer, key) => (
          <StreamerInList key={key} streamer={streamer} top />
        ))}
      </div>
    </>
  );
};

export default TopEight;
