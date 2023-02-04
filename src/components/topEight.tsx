import type { Streamer } from "@prisma/client";
import Image from "next/image";
import Draggable from "react-draggable";
import StreamerInList from "./streamerInList";
export const TopEight: React.FC<{
  open: boolean;
  topEight?: Streamer[];
  handleRemoveStreamer?: (streamer_id: string) => void;
}> = ({ open, topEight, handleRemoveStreamer }) => {
  if (!topEight?.length) {
    return <></>;
  }
  return (
    <>
      <div className={`my-2 ${open ? "" : "w-full"}`}>
        {topEight.map((streamer, key) => (
          <StreamerInList
            key={key}
            size={open ? "full" : "mini"}
            streamer={streamer}
            handleRemoveStreamer={handleRemoveStreamer}
            top={true}
          />
        ))}
      </div>
    </>
  );
};

export default TopEight;
