import { api } from "../utils/api";
import { ReactSortable } from "react-sortablejs";

export default function Test() {
  return <BasicFunction />;
}

export const BasicFunction: React.FC = () => {
  const apiContext = api.useContext();
  const stuff = api.twitch.getTest.useQuery(undefined, {});
  const stuffMutate = api.twitch.mutTest.useMutation({
    onSuccess: async () => {
      await apiContext.twitch.getTest.invalidate();
    },
    onMutate: async ({ stuff }) => {
      await apiContext.twitch.getTest.cancel();
      const previousTest = apiContext.twitch.getTest.getData();
      apiContext.twitch.getTest.setData(undefined, () =>
        stuff.map((thing, id) => {
          return { item: thing, id };
        })
      );
      return { previousTest };
    },
  });
  const statesAreTheSame = (
    newState: { item: string; id: number }[],
    previousState?: { item: string; id: number }[]
  ) => {
    for (const [index, value] of Object.entries(newState)) {
      if (previousState?.[Number(index)]?.item !== value.item) {
        return false;
      }
    }
    return true;
  };
  const handleStuffMutate = (newState: { item: string; id: number }[]) => {
    if (statesAreTheSame(newState, stuff.data)) return newState;
    const newStuff = newState.map((thing) => thing.item);
    stuffMutate.mutate({ stuff: newStuff });
    return newState;
  };

  if (!stuff.data) return <></>;
  return (
    <ReactSortable
      revertOnSpill={false}
      group="groupName"
      animation={70}
      swapThreshold={0.7}
      list={stuff.data}
      setList={handleStuffMutate}
      ghostClass="opacity-0"
    >
      {stuff.data.map((item) => (
        <div className="m-2 cursor-grab bg-white p-3" key={item.id}>
          {item.item}
        </div>
      ))}
    </ReactSortable>
  );
};
