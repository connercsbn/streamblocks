import { signIn, signOut, useSession } from "next-auth/react";
import MyCalendar from "../components/calendar";
import Image from "next/image";
import { api } from "../utils/api";
import { useRef, useState } from "react";
import { type NextPage } from "next";
import { type Event } from "react-big-calendar";
import type { Streamer } from "@prisma/client";

const GetCalendar: React.FC = () => {
  const { data: sessionData } = useSession();
  const [calendarStreamers, setCalendarStreamers] = useState([] as Streamer[]);
  const newStreamerInput = useRef<HTMLInputElement>(null);
  const apiContext = api.useContext();
  const following = api.twitch.getFollowing.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  if (following.data && !calendarStreamers.length) {
    setCalendarStreamers(following.data);
  }
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
  const calendar = api.twitch.getCalendar.useQuery(
    { streamer_ids: calendarStreamers.map((streamer) => streamer.id) },
    { enabled: !!calendarStreamers[0]?.id }
  );
  if (!sessionData?.user) {
    return <></>;
  }
  return (
    <>
      <MyCalendar
        events={[]}
        // events={
        // (calendar.data?.flat().map(({start_time, end_time, title}) => {
        //     return {
        //       start: new Date(start_time),
        //       end: new Date(end_time),
        //       title,
        //     };
        //   }) as Event[])
        // }
      />
      <button
        className="relative m-4 self-end rounded-full bg-white/10 p-4 px-6 font-bold text-white no-underline transition hover:bg-white/20"
        onClick={() => follow.mutate({ streamer: "whatever" })}
      >
        Load streamers you follow
      </button>
      <div className="text-lg text-white">{JSON.stringify(calendar.data)}</div>
      {/* <form
        className="my-4 flex"
        onSubmit={(e) => {
          e.preventDefault();
          follow.mutate({
            streamer: newStreamerInput.current?.value as string,
          });
        }}
      >
        <input className="p-3" type="text" ref={newStreamerInput}></input>
        <button
          className="relative bg-white/10 font-semibold text-white no-underline transition hover:bg-white/20"
          type="submit"
        >
          {follow.isLoading ? (
            <Image
              alt=""
              height={50}
              width={50}
              src="https://media4.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif?cid=ecf05e4759g7spk1paw3gj518r8tkr534lq4bbqm43d2eycj&rid=giphy.gif&ct=g"
            />
          ) : (
            <div className="px-3 py-3">Follow</div>
          )}
        </button>
      </form> */}
      {/* <p className="text-2xl font-extrabold  text-white underline">
        You are following:
      </p> */}
      <div className="my-2">
        {calendarStreamers.length ? (
          calendarStreamers.map((streamer, key) => (
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
                  {streamer.display_name} - {streamer.view_count} -{" "}
                  {following.data?.length}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="font-bold text-white">no one</div>
        )}
      </div>
      {/* {(calendar.isFetching || calendar.isFetched) && (
        <div className="relative mt-2 flex flex-col justify-between rounded-md border border-purple-200/20 bg-white/5 text-sm text-purple-100 subpixel-antialiased transition-colors hover:border-purple-300/50 md:text-base">
          <div className="flex items-center space-x-4 bg-white/10 p-2 pl-5 transition-colors hover:bg-white/20">
            <p className="text-t3-purple-200 text-lg font-medium leading-6 md:text-xl">
              Schedule
            </p>
          </div>
          <div className="m-6 text-sm text-purple-100 subpixel-antialiased md:text-base">
            {Array.isArray(calendar.data) ? (
              !!calendar.data.length ? (
                calendar.data.map(({ title, start_time }, id) => (
                  <h3
                    key={id}
                    className="font-mono text-2xl font-bold text-white"
                  >
                    {new Date(start_time as string).toDateString()} -- {title}
                  </h3>
                ))
              ) : (
                <h3 className="font-mono text-2xl font-bold text-white">
                  Schedule not found
                </h3>
              )
            ) : (
              <>
                <Image
                  alt=""
                  height={50}
                  width={50}
                  src="https://media4.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif?cid=ecf05e4759g7spk1paw3gj518r8tkr534lq4bbqm43d2eycj&rid=giphy.gif&ct=g"
                />
              </>
            )}
          </div>
        </div>
      )} */}
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
