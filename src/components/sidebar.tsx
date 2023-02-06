import Following from "../components/following";
import Favorites from "./favorites";
import { type RouterOutputs, api } from "../utils/api";
import useWindowSize from "../utils/useWindowSize";
import { useState } from "react";

const Sidebar: React.FC<{
  following: RouterOutputs["twitch"]["getFollowing"];
}> = ({ following }) => {
  const apiContext = api.useContext();
  const createCalendars = api.twitch.addCalendars.useMutation();
  const follow = api.twitch.follow.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getFollowing.invalidate();
      createCalendars.mutate();
    },
  });
  const { height } = useWindowSize();
  const toggleCalendar = api.twitch.toggleOnCalendar.useMutation({
    onMutate: ({ streamerId }) => {
      apiContext.twitch.getCalendar.setData(undefined, (data) =>
        data?.map((streamer) =>
          streamer.id === streamerId
            ? { ...streamer, isOnCalendar: !streamer.isOnCalendar }
            : streamer
        )
      );
      apiContext.twitch.getFollowing.setData(undefined, (data) =>
        data?.map((streamer) =>
          streamer.id === streamerId
            ? { ...streamer, isOnCalendar: !streamer.isOnCalendar }
            : streamer
        )
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const toggleFavorite = api.twitch.toggleFavorite.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getFollowing.invalidate();
      await apiContext.twitch.getCalendar.invalidate();
    },
    onMutate: async ({ streamerId }) => {
      await apiContext.twitch.getFollowing.cancel();
      const previousFollowing = apiContext.twitch.getFollowing.getData();
      apiContext.twitch.getFollowing.setData(undefined, (data) => {
        for (const streamer of data ?? []) {
          if (streamer.id === streamerId) {
            streamer.isFavorite = !streamer.isFavorite;
          }
        }
        return data;
      });
      return { previousFollowing };
    },
  });
  const handleToggleCalendar = (streamerId: number) => {
    toggleCalendar.mutate({ streamerId: streamerId });
  };
  const handleToggleFavorite = (streamerId: number) => {
    toggleFavorite.mutate({ streamerId: streamerId });
  };
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        style={height ? { height: height - 56 } : {}}
        className={`${open ? "w-80" : "w-16"} overflow-scroll bg-slate-900`}
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
          <Favorites
            open={open}
            following={following}
            handleToggleFavorite={handleToggleFavorite}
            handleToggleCalendar={handleToggleCalendar}
          />
          {open && (
            <h3 className="my-4 px-4 text-lg font-bold text-white">
              Following
            </h3>
          )}
          <Following
            open={open}
            following={following}
            handleToggleFavorite={handleToggleFavorite}
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
