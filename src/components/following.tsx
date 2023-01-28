import type { Streamer } from "@prisma/client";
import Image from "next/image";
import { api } from "../utils/api";

export const Following: React.FC<{
  streamers?: Streamer[];
}> = ({ streamers }) => {
  const apiContext = api.useContext();
  const addTopEight = api.twitch.addToTopEight.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getTopEight.invalidate();
    },
    onMutate: async ({ streamer_id }) => {
      const newStreamer = streamers?.find(
        (streamer) => streamer.id === streamer_id
      );
      await apiContext.twitch.getTopEight.cancel();
      const previousTopEight = apiContext.twitch.getTopEight.getData();
      apiContext.twitch.getTopEight.setData(undefined, (data) =>
        data && newStreamer ? [...data, newStreamer] : data
      );
      return { previousTopEight };
    },
  });
  return (
    <>
      <p className="text-2xl font-extrabold  text-white underline">
        You are following (limited to 10 for the time being):
      </p>
      <div className="my-2">
        {streamers?.length ? (
          streamers.map((streamer, key) => (
            <div
              className={
                "block pt-1 text-2xl font-bold text-white hover:text-white"
              }
              key={key}
            >
              <div className="flex align-middle">
                <div className="relative mr-2 h-full self-center">
                  <Image
                    alt=""
                    src={streamer.image_url}
                    height={30}
                    width={30}
                  ></Image>
                </div>
                <div className="">
                  <span>{streamer.display_name}</span>
                  <span className="mx-5">
                    <button
                      onClick={() =>
                        void addTopEight.mutate({ streamer_id: streamer.id })
                      }
                      className="relative self-end rounded-full bg-white/10 p-1 px-2 text-sm font-bold text-white no-underline transition hover:bg-white/20"
                    >
                      Add to top 8
                    </button>
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="font-bold text-white">no one</div>
        )}
      </div>
    </>
  );
};

export default Following;
