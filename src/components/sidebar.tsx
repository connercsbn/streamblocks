import Following from "../components/following";
import TopEight from "../components/topEight";
import { type RouterOutputs, api } from "../utils/api";
import useWindowSize from "../utils/useWindowSize";

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

  return (
    <>
      <div
        style={height ? { height: height - 56 } : {}}
        className="overflow-scroll bg-slate-900"
      >
        <div className="p-4">
          <TopEight
            topEight={topEight}
            handleRemoveStreamer={handleRemoveStreamer}
          />
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
