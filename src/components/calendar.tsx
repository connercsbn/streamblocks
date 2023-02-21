import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { api } from "../utils/api";
import moment from "moment";
import type { Event } from "react-big-calendar";
import overlapfunction from "../utils/overlap";
import useWindowSize from "../utils/useWindowSize";

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

export default function MyCalendar() {
  // console.log("liveStatuses", liveStatuses);
  const { height } = useWindowSize();
  const following = api.twitch.getFollowing.useQuery();

  const formattedEvents = (following?.data ?? [])
    .filter((streamer) => streamer.isOnCalendar && streamer.isFavorite)
    .map(({ calendar, id, displayName, isOnCalendar }, number) => {
      return (calendar?.segments ?? []).map(
        ({ startTime, endTime, title }) => ({
          start: new Date(startTime),
          end: new Date(endTime),
          title: `${displayName}` + (title ? ": " + title : ""),
          streamerOrder: number,
          streamer: displayName,
          isOnCalendar,
        })
      );
    })
    .flat()
    .filter(Boolean) as (Event & {
    streamer: string;
    streamerOrder: number;
    isOnCalendar: boolean;
  })[];

  return (
    <>
      <div className="w-full bg-white">
        <Calendar
          defaultView="week"
          localizer={localizer}
          events={formattedEvents.reverse()}
          startAccessor="start"
          endAccessor="end"
          style={height ? { height: height - 56 } : {}}
          dayLayoutAlgorithm={overlapfunction}
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
    </>
  );
}
