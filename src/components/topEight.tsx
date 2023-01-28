import type { Streamer } from "@prisma/client";
import Image from "next/image";
import Draggable from "react-draggable";
export const TopEight: React.FC<{ topEight?: Streamer[] }> = ({ topEight }) => {
  if (!topEight?.length) {
    return (
      <>
        <p className="text-2xl font-extrabold  text-white underline">
          Your top 8
        </p>
        <div className="mb-4 font-bold text-white">no one</div>
      </>
    );
  }
  return (
    <>
      <p className="text-2xl font-extrabold  text-white underline">
        Your top 8
      </p>
      <div className="mb-4">
        {topEight.map((streamer, key) => (
          <Draggable
            key={key}
            axis="y"
            onStart={(e, data) => {
              console.log(e);
              console.log(data);
            }}
            onStop={(e, data) => {
              console.log(e);
              console.log(data);
            }}
          >
            <div
              className={
                "block cursor-default pt-1 text-2xl font-bold text-white hover:text-white"
              }
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
                <div className="">{streamer.display_name}</div>
              </div>
            </div>
          </Draggable>
        ))}
      </div>
    </>
  );
};

export default TopEight;
