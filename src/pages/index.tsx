import { useSession } from "next-auth/react";
import Nav from "../components/nav";
import type { Progress } from "@prisma/client";
import { useEffect, useState } from "react";
import MyCalendar from "../components/calendar";
import Image from "next/image";
import { type NextPage } from "next";
import type { Streamer } from "@prisma/client";
import Sidebar from "../components/sidebar";
import { signIn } from "next-auth/react";
import { api } from "../utils/api";
import { Transition } from "@headlessui/react";
import { setTimeout } from "timers";

const Home: NextPage = () => {
  const apiContext = api.useContext();
  const { data: sessionData, status: sessionStatus } = useSession();
  const initiate = api.twitch.initiate.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getInitiated.invalidate();
    },
    onMutate: async () => {
      await apiContext.twitch.getInitiated.cancel();
      const previousInitiatedState = apiContext.twitch.getFollowing.getData();
      apiContext.twitch.getInitiated.setData(undefined, () => "INITIATING");
      return { previousInitiatedState };
    },
  });
  const initiated = api.twitch.getInitiated.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });

  const [settingThingsUpStillShowing, setSettingThingsUpStillShowing] =
    useState(false);

  useEffect(() => {
    if (initiated.data === "UNINITIATED") {
      initiate.mutate();
      setSettingThingsUpStillShowing(true);
    }
    if (initiated.data === "INITIATED") {
      setTimeout(() => {
        setSettingThingsUpStillShowing(false);
      }, 3000);
    }
  }, [initiated, initiate]);

  if (sessionData?.user && initiated.data) {
    return (
      <>
        {initiated.data === "INITIATED" && (
          <>
            <Nav />
            <div className="flex w-full">
              <Sidebar />
              <div className="w-full">
                <MyCalendar />
              </div>
            </div>
          </>
        )}

        <Transition
          show={initiated.data !== "INITIATED" || settingThingsUpStillShowing}
          enter="transition-opacity duration-1000"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-1000"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 z-50 h-full w-full bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <SettingThingsUpForYou />
            </div>
          </div>
        </Transition>
      </>
    );
  }
  if (sessionStatus === "unauthenticated") {
    return (
      <>
        <div className="flex min-h-screen flex-row content-center items-center justify-center">
          <div className="flex flex-col gap-7 pt-20">
            <button
              className="semibold z-10 flex max-w-fit items-center self-center rounded-md border-2 border-purple-400 bg-[#32145d]/90 p-3 px-5 text-white no-underline transition hover:bg-[#481f84e6]"
              onClick={() =>
                void signIn("twitch", {
                  redirect: false,
                })
              }
            >
              <span>
                Sign in with <span className="font-bold">Twitch</span>
              </span>
              <TwitchIcon />
            </button>
          </div>
        </div>
      </>
    );
  }
  return <></>;
};
const SettingThingsUpForYou = () => {
  const apiContext = api.useContext();
  const addCalendar = api.twitch.addCalendar.useMutation();
  const initiated = api.twitch.getInitiated.useQuery();
  const [progress, setProgress] = useState<
    (Progress & { streamersToAdd: Streamer[] }) | false
  >(false);
  const follow = api.twitch.follow.useMutation({
    onSettled: () => {
      void apiContext.twitch.getFollowing.invalidate();
      void apiContext.twitch.getLiveStatus.invalidate();
    },
  });
  const addAllCalendars = async () => {
    let progress: (Progress & { streamersToAdd: Streamer[] }) | false = false;

    console.log("adding next calendar");
    while ((progress = await addCalendar.mutateAsync())) {
      setProgress(progress);
    }
    void apiContext.twitch.getInitiated.invalidate();
  };

  if (addCalendar.isIdle && follow.isIdle) {
    follow.mutate(undefined, {
      onError(error, variables, context) {
        console.log({ error, variables, context });
      },
      onSuccess: () => {
        void addAllCalendars();
      },
    });
  }
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);
  return (
    <Transition
      show={show}
      enter="transition-opacity duration-1000"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="text-white">
        Setting some things up for you... <br></br>
        <br></br>
        <p>
          {progress && (
            <>
              <pre>
                {JSON.stringify(
                  {
                    currentStreamer: progress.streamersToAdd[0]?.displayName,
                    streamersToAddLength: progress.streamersToAdd.length,
                    totalToAdd: progress.numStreamersToAdd,
                    officialAdded: progress.numStreamersAdded,
                  },
                  undefined,
                  2
                )}
              </pre>
              <br></br>
              <br></br>
              <br></br>
              <pre>
                {new Array(progress.numStreamersAdded)
                  .fill(0)
                  .map(() => "X")
                  .join("") +
                  new Array(
                    progress.numStreamersToAdd - progress.numStreamersAdded
                  )
                    .fill(0)
                    .map(() => "-")
                    .join("")}
              </pre>
            </>
          )}
        </p>
      </div>
    </Transition>
  );
};

const TwitchIcon = () => (
  <svg
    overflow="visible"
    width="50px"
    height="50px"
    version="1.1"
    viewBox="0 0 40 40"
    x="0px"
    y="0px"
    className="ScSvg-sc-mx5axi-2 UMhCH"
  >
    <g>
      <polygon
        points="13 8 8 13 8 31 14 31 14 36 19 31 23 31 32 22 32 8"
        className="fill-purple-500"
      >
        <animate
          dur="150ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="points"
          from="13 8 8 13 8 31 14 31 14 36 19 31 23 31 32 22 32 8"
          to="16 5 8 13 8 31 14 31 14 36 19 31 23 31 35 19 35 5"
        ></animate>
        <animate
          dur="250ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="points"
          from="16 5 8 13 8 31 14 31 14 36 19 31 23 31 35 19 35 5"
          to="13 8 8 13 8 31 14 31 14 36 19 31 23 31 32 22 32 8"
        ></animate>
        <animate
          dur="50ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="points"
          to="13 8 8 13 8 31 14 31 14 36 19 31 23 31 32 22 32 8"
          from="16 5 8 13 8 31 14 31 14 36 19 31 23 31 35 19 35 5"
        ></animate>
        <animate
          dur="75ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="points"
          to="16 5 8 13 8 31 14 31 14 36 19 31 23 31 35 19 35 5"
          from="13 8 8 13 8 31 14 31 14 36 19 31 23 31 32 22 32 8"
        ></animate>
      </polygon>
      <polygon
        points="26 25 30 21 30 10 14 10 14 25 18 25 18 29 22 25"
        className="fill-white"
      >
        <animateTransform
          dur="150ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="transform"
          type="translate"
          from="0 0"
          to="3 -3"
        ></animateTransform>
        <animateTransform
          dur="250ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="transform"
          type="translate"
          from="3 -3"
          to="0 0"
        ></animateTransform>
        <animateTransform
          dur="50ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="transform"
          type="translate"
          from="3 -3"
          to="0 0"
        ></animateTransform>
        <animateTransform
          dur="75ms"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.25 0.1 0.25 1"
          attributeName="transform"
          type="translate"
          from="0 0"
          to="3 -3"
        ></animateTransform>
      </polygon>
      <g className="fill-purple-500">
        <path
          d="M20,14 L22,14 L22,20 L20,20 L20,14 Z M27,14 L27,20 L25,20 L25,14 L27,14 Z"
          className="ScBody-sc-mx5axi-3 gktgjG"
        >
          <animateTransform
            dur="150ms"
            begin="indefinite"
            fill="freeze"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.25 0.1 0.25 1"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="3 -3"
          ></animateTransform>
          <animateTransform
            dur="250ms"
            begin="indefinite"
            fill="freeze"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.25 0.1 0.25 1"
            attributeName="transform"
            type="translate"
            from="3 -3"
            to="0 0"
          ></animateTransform>
          <animateTransform
            dur="50ms"
            begin="indefinite"
            fill="freeze"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.25 0.1 0.25 1"
            attributeName="transform"
            type="translate"
            from="3 -3"
            to="0 0"
          ></animateTransform>
          <animateTransform
            dur="75ms"
            begin="indefinite"
            fill="freeze"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.25 0.1 0.25 1"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="3 -3"
          ></animateTransform>
        </path>
      </g>
    </g>
  </svg>
);

export default Home;
