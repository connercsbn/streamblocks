import Following from "../components/following";
import TopEight from "../components/topEight";
import { type RouterOutputs, api } from "../utils/api";
import useWindowSize from "../utils/useWindowSize";
import { useState } from "react";

const Sidebar: React.FC<{
  topEight: RouterOutputs["twitch"]["getTopEight"];
  following: RouterOutputs["twitch"]["getFollowing"];
}> = ({ topEight, following }) => {
  const apiContext = api.useContext();
  const follow = api.twitch.follow.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getFollowing.invalidate();
    },
  });
  const { height } = useWindowSize();
  const removeFromTopEight = api.twitch.removeFromTopEight.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getTopEight.invalidate();
    },
    onMutate: async ({ streamer_id }) => {
      const streamerToRemove = topEight?.find(
        (streamer) => streamer.id === streamer_id
      );
      await apiContext.twitch.getTopEight.cancel();
      const previousTopEight = apiContext.twitch.getTopEight.getData();
      apiContext.twitch.getTopEight.setData(undefined, (data) =>
        data?.filter((streamer) => streamer.id !== streamer_id)
      );
      apiContext.twitch.getFollowing.setData(undefined, (data) =>
        data && streamerToRemove ? [...data, streamerToRemove] : data
      );
      return { previousTopEight };
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
      apiContext.twitch.getFollowing.setData(undefined, (data) =>
        data?.filter((streamer) => streamer.id !== streamer_id)
      );
      apiContext.twitch.getTopEight.setData(undefined, (data) =>
        data && newStreamer ? [...data, newStreamer] : data
      );
      return { previousTopEight };
    },
  });
  const handleRemoveStreamer = (streamer_id: string) => {
    removeFromTopEight.mutate({ streamer_id: streamer_id });
  };
  const handleAddStreamer = (streamer_id: string) => {
    addTopEight.mutate({ streamer_id: streamer_id });
  };
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        style={height ? { height: height - 56 } : {}}
        className={`${open ? "w-96" : "w-16"} overflow-scroll bg-slate-900`}
      >
        <div className={`${open ? "" : "flex flex-col items-center"}`}>
          <div
            className={`flex items-center p-4
         ${open ? "pr-3" : ""}  justify-between pb-1 align-middle`}
          >
            {open && (
              <h3 className="text-lg font-bold text-white">Favorites</h3>
            )}
            <button
              onClick={() => setOpen(!open)}
              className={`h-8 w-8 rounded-md p-1 hover:bg-white/10 ${
                open ? "" : "-scale-x-100"
              }`}
            >
              <svg fill="white" viewBox="0 0 20 20">
                <path d="M16 16V4h2v12h-2zM6 9l2.501-2.5-1.5-1.5-5 5 5 5 1.5-1.5-2.5-2.5h8V9H6z"></path>
              </svg>
            </button>
          </div>
          <TopEight
            open={open}
            topEight={topEight}
            handleRemoveStreamer={handleRemoveStreamer}
          />
          {open && (
            <h3 className="my-4 px-4 text-lg font-bold text-white">
              Following
            </h3>
          )}
          <Following
            open={open}
            streamers={following}
            handleAddStreamer={handleAddStreamer}
          />
          {open && (
            <button
              className="text-md relative my-4 self-end rounded-lg bg-white/10 p-2 px-5 font-bold text-white no-underline transition hover:bg-white/20"
              onClick={() => follow.mutate()}
            >
              Load streamers you follow
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
