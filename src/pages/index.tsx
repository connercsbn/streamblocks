import { useSession } from "next-auth/react";
import Nav from "../components/nav";
import MyCalendar from "../components/calendar";
import { api } from "../utils/api";
import { type PropsWithChildren } from "react";
import { type NextPage } from "next";
import Sidebar from "../components/sidebar";
import { signIn } from "next-auth/react";
import type { Streamer } from "@prisma/client";
import { type RouterOutputs } from "../utils/api";

const GetCalendar = ({
  following,
}: PropsWithChildren<{
  following: RouterOutputs["twitch"]["getFollowing"];
}>) => {
  const { data: sessionData } = useSession();
  const favorites = following?.filter((streamer) => streamer.isFavorite) ?? [];
  const calendar = api.twitch.getCalendar.useQuery(
    {
      streamerIds:
        favorites
          ?.filter((streamer) => streamer.isFavorite && streamer.isOnCalendar)
          .map((streamer) => streamer.id) ?? [],
    },
    {
      enabled: !!favorites?.length,
      refetchOnWindowFocus: false,
    }
  );
  const liveStatuses = api.twitch.getLiveStatus.useQuery(
    { streamer_ids: favorites?.map((streamer) => streamer.twitchId) ?? [] },
    {
      enabled: !!favorites?.some((streamer) => streamer.twitchId),
      refetchOnWindowFocus: false,
    }
  );

  if (!sessionData?.user) {
    return <></>;
  }
  return (
    <>
      <div className="w-full">
        <MyCalendar
          events={
            calendar.data?.filter(
              (streamerCalendar) => streamerCalendar.isOnCalendar
            ) ?? []
          }
          liveStatuses={liveStatuses.data ?? []}
        />
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const following = api.twitch.getFollowing.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  if (sessionData?.user) {
    return (
      <>
        <Nav />
        <div className="flex w-full">
          <Sidebar following={following.data} />
          <GetCalendar following={following.data ?? []} />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex min-h-screen flex-row content-center items-center justify-center">
        <div className="flex flex-col gap-7 pb-60">
          <h1 className=" flex-grow-0 text-3xl text-white">landing page</h1>
          <button
            className="semibold max-w-fit self-center rounded-full bg-white/10 px-4 py-1 text-white no-underline transition hover:bg-white/20"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
