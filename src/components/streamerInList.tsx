import { type PropsWithChildren } from "react";
import Image from "next/image";
import type { Streamer } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import { useState } from "react";

export default function Streamer({
  streamer,
  top,
  handleAddStreamer,
}: PropsWithChildren<{
  streamer: Streamer;
  top?: boolean;
  handleAddStreamer?: (streamer_id: string) => void;
}>) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative flex py-1 align-middle text-white"
    >
      <div className="relative mr-2 h-full self-center">
        <Image alt="" src={streamer.image_url} height={30} width={30}></Image>
      </div>
      <div className="">
        <span>{streamer.display_name}</span>
      </div>
      <div className="absolute right-0">
        {!top && handleAddStreamer && isHovering && (
          <span className="relative ml-2">
            <button
              onClick={() => handleAddStreamer(streamer.id)}
              className="self-end rounded-full bg-slate-700/80 p-1 text-sm  font-bold text-white no-underline transition hover:bg-slate-500/80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.4}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
// <div
//   className={
//     "block cursor-default pt-1 text-2xl font-bold text-white hover:text-white"
//   }
//   key={key}
// >
//   <div className="flex align-middle">
//     <div className="relative mr-2 h-full self-center">
//       <Image
//         alt=""
//         src={streamer.image_url}
//         height={30}
//         width={30}
//       ></Image>
//     </div>
//     <div className="">
//       <span>{streamer.display_name}</span>
//       <span className="mx-5">
//         <button
//           onClick={() =>
//             void addTopEight.mutate({ streamer_id: streamer.id })
//           }
//           className="relative self-end rounded-full bg-white/10 p-1 px-2 text-sm font-bold text-white no-underline transition hover:bg-white/20"
//         >
//           Add to top 8
//         </button>
//       </span>
//     </div>
//   </div>
// </div>
