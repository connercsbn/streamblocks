import { useSession } from "next-auth/react";
import Nav from "../components/nav";
import type { Progress } from "@prisma/client";
import { useEffect, useState } from "react";
import MyCalendar from "../components/calendar";
import LandingPage from "../components/landingPage";
import { type NextPage } from "next";
import type { Streamer } from "@prisma/client";
import Sidebar from "../components/sidebar";
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
    return <LandingPage />;
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
    console.log("call follow mutation");
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

export default Home;
