import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { type PropsWithChildren } from "react";
import type { Event } from "react-big-calendar";
import { type RouterOutputs } from "../utils/api";
import overlapfunction from "../utils/overlap";
import nooverlapfunction from "../utils/nooverlap";
import { useState } from "react";
import { type ChangeEvent } from "react";

const localizer = momentLocalizer(moment);

const streamerColorMap = [
  "bg-red-300 border-red-600",
  "bg-orange-300 border-orange-600",
  "bg-amber-300 border-amber-600",
  "bg-yellow-300 border-yellow-600",
  "bg-lime-300 border-lime-600",
  "bg-green-300 border-green-600",
  "bg-emerald-300 border-emerald-600",
  "bg-teal-300 border-teal-600",
  "bg-cyan-300 border-cyan-600",
  "bg-sky-300 border-sky-600",
  "bg-blue-300 border-blue-600",
  "bg-indigo-300 border-indigo-600",
  "bg-violet-300 border-violet-600",
  "bg-purple-300 border-purple-600",
  "bg-fuscia-300 border-fuscia-600",
  "bg-pink-300 border-pink-600",
  "bg-rose-300 border-rose-600",
];

export default function MyCalendar({
  events,
}: PropsWithChildren<{ events: RouterOutputs["twitch"]["getCalendar"] }>) {
  const [wantsOverlap, setWantsOverlap] = useState<boolean>(false);

  const handleOverlapChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWantsOverlap(e.target.checked);
  };

  const things = events
    .map(({ calendar, streamer_name }, number) => {
      return calendar?.data?.segments?.map(
        ({ start_time, end_time, title }) => {
          return {
            start: new Date(start_time),
            end: new Date(end_time),
            title: `${streamer_name}` + (title ? ": " + title : ""),
            streamer: streamer_name,
            streamerOrder: number,
          };
        }
      );
    })
    .flat()
    .filter(Boolean) as (Event & {
    streamer: string;
    streamerOrder: number;
  })[];

  return (
    <div className="w-full bg-white">
      <div className="flex items-center  bg-blue-800 text-center">
        <input
          className="m-7 h-6 w-6 p-7"
          onChange={(e) => handleOverlapChange(e)}
          type="checkbox"
        />
        <span className="text-center align-middle text-white">
          Switch overlap mode (for testing)
        </span>
      </div>
      <Calendar
        defaultView="week"
        localizer={localizer}
        events={things.reverse()}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 1100 }}
        dayLayoutAlgorithm={wantsOverlap ? overlapfunction : nooverlapfunction}
        eventPropGetter={(event) => {
          return {
            className: `${
              streamerColorMap.at(event.streamerOrder) ?? ""
            } border-2 rounded-md border-solid text-black shadow-lg`,
          };
        }}
        className=""
      />
    </div>
  );
}

// --------------------------------------
// for testing
// const things = [
//   {
//     start: new Date("January 29, 2023 15:46"),
//     end: new Date("January 29, 2023 19:46"),
//     title: "first",
//     something: "watever",
//   },
//   {
//     start: new Date("January 29, 2023 10:00"),
//     end: new Date("January 29, 2023 17:46"),
//     title: "second",
//     something: "watever",
//   },
//   {
//     start: new Date("January 29, 2023 10:00"),
//     end: new Date("January 29, 2023 17:46"),
//     title: "third",
//     something: "watever",
//   },
// ];
