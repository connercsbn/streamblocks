import { Fragment, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import type {
  Streamer,
  UnofficialDay,
  UnofficialSchedule,
} from "@prisma/client";
import TimePicker from "../components/timepicker";
import Link from "next/link";
import Image from "next/image";
import { PlusButton, X, MyButton } from "./buttons";
import { api } from "../utils/api";

export default function Example({
  streamer,
}: {
  streamer: Streamer & {
    calendar: {
      unofficialSchedule: {
        unofficialDays: UnofficialDay[];
      } | null;
      _count: {
        segments: number;
      };
    } | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const getInitialDaysObject = () => {
    const unofficialDays =
      streamer?.calendar?.unofficialSchedule?.unofficialDays;
    if (unofficialDays?.length) {
      console.log({ unofficialDays });
    }
    return streamer?.calendar?.unofficialSchedule?.unofficialDays || [];
  };

  const [daysAdded, setDaysAdded] = useState(getInitialDaysObject());
  const apiContext = api.useContext();

  const unofficialScheduleMutation =
    api.twitch.addUnofficialCalendar.useMutation({
      onSuccess: async () => {
        await apiContext.twitch.getFollowing.invalidate();
      },
    });

  const updateUnofficialSchedule = () => {
    unofficialScheduleMutation.mutate({
      streamerId: streamer.id,
      unofficialSchedule: daysAdded,
    });
  };

  const toggleDay = (day: string, time?: Date) => {
    setDaysAdded({ ...daysAdded, [day]: time });
    console.log(daysAdded);
  };

  const handleSave = () => {
    updateUnofficialSchedule();
  };
  const handleCancel = () => {
    setDaysAdded(getInitialDaysObject());
  };

  if (!streamer) return <></>;

  return (
    <>
      <MyButton color={"yellow"} onClick={() => setOpen(!open)}>
        <PlusButton />
      </MyButton>
      <Dialog
        as="div"
        open={open}
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <div className="fixed inset-0 bg-white/30" aria-hidden="true" />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-white"
                      >
                        <div className="flex items-center">
                          <div className="mr-4 rounded-xl border-4">
                            <Image
                              alt=""
                              className="rounded-lg"
                              src={streamer.imageUrl}
                              height={50}
                              width={50}
                            ></Image>
                          </div>
                          {streamer?.displayName}
                        </div>
                      </Dialog.Title>
                    </div>
                    <div className="mt-2 w-full">
                      <p className="mx-auto w-2/3 text-sm text-white">
                        👋 Hey! check 👀{" "}
                        <Link
                          target="_blank"
                          className="underline"
                          href={`http://www.twitch.tv/${streamer.displayName}/about`}
                        >
                          {streamer.displayName}&apos;s 🏋️ profile
                        </Link>{" "}
                        🤤 for a schedule. <br />
                        Now that&apos;s a vibe...
                      </p>
                      <div className="mx-auto min-w-min pt-7 text-white ">
                        {Object.keys(daysAdded).map((day, key) => (
                          <TimePicker
                            key={key}
                            toggleDay={toggleDay}
                            day={day}
                            added={!!daysAdded.find((d) => d.day === day)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="top-0 right-0 h-8 w-8 text-white"
                  >
                    <X />
                  </button>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSave}
                >
                  save
                </button>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancel}
                >
                  never mind
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
