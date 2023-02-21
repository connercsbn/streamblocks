import { useSession } from "next-auth/react";
import Nav from "../components/nav";
import MyCalendar from "../components/calendar";
import Image from "next/image";
import { api } from "../utils/api";
import { type NextPage } from "next";
import Sidebar from "../components/sidebar";
import { signIn } from "next-auth/react";
import mrbeast from "../mrbeast.png";

const GetCalendar = () => {
  const calendar = api.twitch.getCalendar.useQuery();
  return (
    <>
      <div className="w-full">
        <MyCalendar
          events={calendar?.data?.filter(
            (streamer) =>
              streamer.isOnCalendar &&
              streamer.isFavorite &&
              streamer.calendar?.segments.length
          )}
        />
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const following = api.twitch.getFollowing.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  if (sessionData?.user) {
    return (
      <>
        <Nav />
        <div className="flex w-full">
          <Sidebar following={following.data} />
          <GetCalendar />
        </div>
      </>
    );
  }
  if (sessionStatus === "unauthenticated") {
    return (
      <>
        <div className="flex min-h-screen flex-row content-center items-center justify-center">
          <div className="flex flex-col gap-7 pt-20">
            <div className="fixed bottom-0 left-0">
              <Image className="" src={mrbeast} alt="" />
            </div>
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
            </button>
          </div>
        </div>
      </>
    );
  }
  return <></>;
};

export default Home;
