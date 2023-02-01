import type { Streamer } from "@prisma/client";
import { api } from "../utils/api";
import Image from "next/image";
import { ReactSortable } from "react-sortablejs";
import { RouterOutputs } from "../utils/api";

export const TopEight: React.FC<{
  topEight?: RouterOutputs["twitch"]["getTopEight"];
}> = ({ topEight }) => {
  const apiContext = api.useContext();
  const topEightMutate = api.twitch.reformatTopEight.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getTopEight.invalidate();
    },
    onMutate: async ({ streamer_ids }) => {
      await apiContext.twitch.getTopEight.cancel();
      const previousTopEight = apiContext.twitch.getTopEight.getData();
      apiContext.twitch.getTopEight.setData(undefined, () => {
        const nextState = streamer_ids.map((streamer_id) =>
          topEight?.find((value) => value.streamer.id === streamer_id)
        );
        return nextState.filter(Boolean) as {
          id: number;
          streamer: Streamer;
        }[];
      });
      return { previousTopEight };
    },
  });
  const statesAreTheSame = (
    newState: { streamer: Streamer; id: number }[],
    previousState?: { streamer: Streamer; id: number }[]
  ) => {
    for (const [index, value] of Object.entries(newState)) {
      if (previousState?.[Number(index)]?.streamer?.id !== value.streamer.id) {
        return false;
      }
    }
    return true;
  };
  const handleStuffMutate = (
    newState: { streamer: Streamer; id: number }[]
  ) => {
    if (statesAreTheSame(newState, topEight)) return newState;
    const newStuff = newState.map((thing) => thing.streamer.id);
    topEightMutate.mutate({ streamer_ids: newStuff });
    return newState;
  };

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
  console.log(topEight);
  return (
    <>
      <p className="text-2xl font-extrabold  text-white underline">
        Your top 8
      </p>
      <div className="mb-4">
        <ReactSortable
          revertOnSpill={false}
          group="groupName"
          animation={70}
          swapThreshold={0.7}
          list={topEight}
          setList={handleStuffMutate}
          ghostClass="opacity-0"
        >
          {topEight.map((streamer) => (
            <div
              key={streamer.id}
              className={
                "block cursor-default pt-1 text-2xl font-bold text-white hover:text-white"
              }
            >
              <div className="flex align-middle">
                <div className="relative mr-2 h-full self-center">
                  <Image
                    alt=""
                    src={streamer?.streamer?.image_url}
                    height={30}
                    width={30}
                  ></Image>
                </div>
                <div className="">{streamer?.streamer?.display_name}</div>
              </div>
            </div>
          ))}
        </ReactSortable>
      </div>
    </>
  );
};
export default TopEight;
