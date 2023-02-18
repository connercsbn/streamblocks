import Following from "../components/following";
import Favorites from "./favorites";
import { type RouterOutputs, api } from "../utils/api";
import useWindowSize from "../utils/useWindowSize";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import Live from "./live";
import { z } from "zod";
import { useLocalStorage } from "../utils/useLocalStorage";

const Sidebar: React.FC<{
  following: RouterOutputs["twitch"]["getFollowing"] | undefined;
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
  const [followingOpen, setFollowingOpen] = useLocalStorage(
    "followingOpen",
    z.boolean(),
    true
  );
  const [favoritesOpen, setFavoritesOpen] = useLocalStorage(
    "favoritesOpen",
    z.boolean(),
    true
  );

  return (
    <>
      <div
        style={height ? { height: height - 56 } : {}}
        className={`${
          open ? "w-80" : "w-16 pt-10"
        } relative overflow-scroll bg-slate-900`}
      >
        <button
          onClick={() => setOpen(!open)}
          className={`absolute z-10 h-8 w-8 rounded-md p-1 hover:bg-white/10 ${
            open ? "top-1 right-3" : "top-1 right-4 -scale-x-100"
          }`}
        >
          <svg fill="white" viewBox="0 0 20 20">
            <path d="M16 16V4h2v12h-2zM6 9l2.501-2.5-1.5-1.5-5 5 5 5 1.5-1.5-2.5-2.5h8V9H6z"></path>
          </svg>
        </button>
        <div className={`${open ? "mt-9" : "flex flex-col items-center"}`}>
          <Live big={open} />
          {open && (
            <button
              onClick={() => setFavoritesOpen(!favoritesOpen)}
              className="w-full hover:bg-white/5"
            >
              <h3 className="flex items-center justify-between p-4 py-1 text-left text-lg font-bold text-white">
                <span className="pr-2">Favorites</span>
                <div className="relative top-[1px]">
                  {favoritesOpen ? (
                    <ChevronDownIcon height={20} strokeWidth={0.8} />
                  ) : (
                    <ChevronUpIcon height={20} strokeWidth={0.8} />
                  )}
                </div>
              </h3>
            </button>
          )}
          {favoritesOpen && (
            <>
              <Favorites
                big={open}
                following={following}
                handleToggleFavorite={handleToggleFavorite}
                handleToggleCalendar={handleToggleCalendar}
              />
            </>
          )}
          {open && (
            <button
              onClick={() => setFollowingOpen(!followingOpen)}
              className="w-full hover:bg-white/5"
            >
              <h3 className="flex items-center justify-between p-4 py-1 text-left text-lg font-bold text-white">
                <span className="pr-2">Following</span>
                <div className="relative top-[1px]">
                  {followingOpen ? (
                    <ChevronDownIcon height={20} strokeWidth={0.8} />
                  ) : (
                    <ChevronUpIcon height={20} strokeWidth={0.8} />
                  )}
                </div>
              </h3>
            </button>
          )}
          {followingOpen && (
            <Following
              big={open}
              following={following}
              handleToggleFavorite={handleToggleFavorite}
            />
          )}
          {open && (
            <>
              <button
                className="text-md relative my-4 self-end rounded-lg bg-white/10 p-2 px-5 font-bold text-white no-underline transition hover:bg-white/20"
                onClick={() => follow.mutate()}
              >
                Load streamers you follow
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
