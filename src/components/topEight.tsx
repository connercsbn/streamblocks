import type { Streamer } from "@prisma/client";
import Image from "next/image";
import Draggable from "react-draggable";
import StreamerInList from "./streamerInList";
export const TopEight: React.FC<{
  topEight?: Streamer[];
  handleRemoveStreamer?: (streamer_id: string) => void;
}> = ({ topEight, handleRemoveStreamer }) => {
  if (!topEight?.length) {
    return <></>;
  }
  return (
    <>
      <div className="mb-4">
        {topEight.map((streamer, key) => (
          <StreamerInList
            key={key}
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
