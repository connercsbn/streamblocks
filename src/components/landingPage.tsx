import { signIn } from "next-auth/react";
import StreamBlocksLogo from "./streamblockslogo";
export default function LandingPage() {
  return (
    <>
      {/* page */}
      <div className="flex min-h-screen w-full flex-row content-center justify-center p-11">
        {/* content */}
        <div className="flex w-full max-w-4xl flex-col gap-4">
          {/* logo container */}
          <div className="w-full max-w-md">
            <StreamBlocksLogo />
          </div>
          <span className="mt-6 max-w-prose text-2xl font-bold text-white">
            All of your favorite streamers&apos; schedules in one place
          </span>
          <span className="max-w-prose text-white">
            The only calendar that sets you up with a schedule for all the
            Twitch streamers you follow. Toggle them on or off, giving you a
            tailored overview of the day, week, and month of Twitch streaming.
          </span>
          <button
            className="semibold my-2 flex max-w-max items-center rounded-full border-2 border-[#32145d]/90 bg-purple-400 p-4 py-1 pb-[5px] text-sm  text-black no-underline transition duration-200 hover:bg-white "
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

const TwitchIcon = () => (
  <svg
    overflow="visible"
    width="30px"
    height="30px"
    version="1.1"
    viewBox="0 0 40 40"
    x="0px"
    y="0px"
    className="ScSvg-sc-mx5axi-2 UMhCH "
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
