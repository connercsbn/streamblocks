import { useSession } from "next-auth/react";
import MyCalendar from "../components/calendar";
import { TopEight, Following } from "../components/following";
import { api } from "../utils/api";
import { useRef } from "react";
import { type NextPage } from "next";
import type { twitch_calendar_response } from "../server/api/routers/twitch";

const GetCalendar: React.FC = () => {
  const { data: sessionData } = useSession();
  const newStreamerInput = useRef<HTMLInputElement>(null);
  const apiContext = api.useContext();
  const following = api.twitch.getFollowing.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  const follow = api.twitch.follow.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getFollowing.invalidate();
    },
    onSettled: () => {
      if (newStreamerInput.current) {
        newStreamerInput.current.value = "";
      }
    },
  });
  const topEight = api.twitch.getTopEight.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  const calendar = api.twitch.getCalendar.useQuery(
    { streamer_ids: topEight.data?.map((streamer) => streamer.id) ?? [] },
    {
      enabled: !!topEight.data?.some((streamer) => streamer.id),
      refetchOnWindowFocus: false,
    }
  );
  if (!sessionData?.user) {
    return <></>;
  }
  return (
    <>
      <MyCalendar events={calendar?.data as twitch_calendar_response[]} />
      <button
        className="relative m-4 self-end rounded-full bg-white/10 p-4 px-6 font-bold text-white no-underline transition hover:bg-white/20"
        onClick={() => follow.mutate()}
      >
        Load streamers you follow
      </button>
      <TopEight topEight={topEight?.data} />
      <Following streamers={following?.data} />
    </>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <div className="container flex flex-col items-start gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Twitch <span className="text-[hsl(280,100%,70%)]">Calendar</span>{" "}
          Thingy
        </h1>
        <div className="flex w-full flex-col items-start gap-2">
          <GetCalendar />
        </div>
      </div>
    </>
  );
};

export default Home;
