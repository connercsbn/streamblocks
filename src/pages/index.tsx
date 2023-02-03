import { useSession } from "next-auth/react";
import Nav from "../components/nav";
import MyCalendar from "../components/calendar";
import { api, type RouterOutputs } from "../utils/api";
import { type PropsWithChildren } from "react";
import { type NextPage } from "next";
import Sidebar from "../components/sidebar";
import { signIn } from "next-auth/react";

const GetCalendar = ({
  topEight,
}: PropsWithChildren<{
  topEight: RouterOutputs["twitch"]["getTopEight"];
}>) => {
  const { data: sessionData } = useSession();
  const calendar = api.twitch.getCalendar.useQuery(
    { streamer_ids: topEight?.map((streamer) => streamer.id) ?? [] },
    {
      enabled: !!topEight?.some((streamer) => streamer.id),
      refetchOnWindowFocus: false,
    }
  );
  const liveStatuses = api.twitch.getLiveStatus.useQuery(
    { streamer_ids: topEight?.map((streamer) => streamer.id) ?? [] },
    {
      enabled: !!topEight?.some((streamer) => streamer.id),
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
          events={calendar.data ?? []}
          liveStatuses={liveStatuses.data ?? []}
        />
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const topEight = api.twitch.getTopEight.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  const following = api.twitch.getFollowing.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  if (sessionData?.user) {
    return (
      <>
        <Nav />
        <div className="flex w-full">
          <Sidebar topEight={topEight.data} following={following.data} />
          <GetCalendar topEight={topEight.data} />
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
