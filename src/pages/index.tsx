import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

import { api } from "../utils/api";
import { useRef, useState } from "react";

const GetCalendar: React.FC = () => {
  const { data: sessionData } = useSession();
  const [activeStreamer, setActiveStreamer] = useState("");
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
  const calendar = api.twitch.getCalendar.useQuery(
    { streamer: activeStreamer },
    { enabled: !!activeStreamer }
  );
  if (!sessionData?.user) {
    return (
      <>
        <button
          className="relative rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          Sign in
        </button>
      </>
    );
  }
  return (
    <>
      <button
        className="absolute top-8 right-8 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
      <form
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
      </form>
      <div className="text-2xl font-bold text-white">You are following</div>
      <div>
        {following.data?.length ? (
          following.data?.map((streamer, key) => (
            <button
              className={
                "block text-2xl font-bold hover:text-white " +
                (streamer.id === activeStreamer
                  ? "text-white"
                  : "text-slate-400")
              }
              onClick={() => {
                setActiveStreamer(streamer.id);
              }}
              key={key}
            >
              {streamer.name}
            </button>
          ))
        ) : (
          <div className="font-bold text-white">no one</div>
        )}
      </div>
      <div>
        {calendar.data?.length ? (
          calendar.data?.map(({ title, start_time }, id) => (
            <h3 key={id} className="text-2xl font-bold text-white">
              {new Date(start_time as string).toDateString()} -- {title}
            </h3>
          ))
        ) : (
          <div className="text-white">
            Streamer doesn&apos;t have a schedule
          </div>
        )}
      </div>
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
        <div className="flex flex-col items-start gap-2">
          <GetCalendar />
        </div>
      </div>
    </>
  );
};

export default Home;
