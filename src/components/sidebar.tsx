import Following from "../components/following";
import TopEight from "../components/topEight";
import { type RouterOutputs, api } from "../utils/api";
import { useEffect } from "react";
import { useState } from "react";
import type { Streamer } from "@prisma/client";

const Sidebar: React.FC<{
  topEight: RouterOutputs["twitch"]["getTopEight"];
  following: RouterOutputs["twitch"]["getFollowing"];
}> = ({ topEight, following }) => {
  const apiContext = api.useContext();
  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    function handleResize() {
      setWindowHeight(window.innerHeight);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const follow = api.twitch.follow.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getFollowing.invalidate();
    },
  });
  const addTopEight = api.twitch.addToTopEight.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getTopEight.invalidate();
    },
    onMutate: async ({ streamer_id }) => {
      const newStreamer = following?.find(
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
  const handleAddStreamer = (streamer_id: string) => {
    addTopEight.mutate({ streamer_id: streamer_id });
  };

  return (
    <>
      <div
        style={{ height: windowHeight - 56 }}
        className="overflow-scroll bg-slate-900"
      >
        <div className="p-4">
          <TopEight topEight={topEight} />
          <Following
            streamers={following}
            handleAddStreamer={handleAddStreamer}
          />
          <button
            className="text-md relative my-4 self-end rounded-lg bg-white/10 p-2 px-5 font-bold text-white no-underline transition hover:bg-white/20"
            onClick={() => follow.mutate()}
          >
            Load streamers you follow
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
