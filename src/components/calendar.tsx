import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "@connerl/react-big-calendar";
import { api } from "../utils/api";
import { datetime, RRule, RRuleSet, rrulestr, WeekdayStr } from "rrule";
import moment from "moment";
import type { Event } from "react-big-calendar";
import overlapfunction from "../utils/overlap";
import useWindowSize from "../utils/useWindowSize";
import convert from "color-convert";

const localizer = momentLocalizer(moment);

const lightened = (hex: string): string => {
  const [hue] = convert.hex.hsl(hex);
  return `hsl(${hue} 100% 80%)`;
};

export default function MyCalendar() {
  const { height } = useWindowSize();
  const following = api.twitch.getFollowing.useQuery();
  const apiContext = api.useContext();
  const addCalendars = api.twitch.addCalendars.useMutation();
  const follow = api.twitch.follow.useMutation({
    onSettled: () => {
      void apiContext.twitch.getFollowing.invalidate();
      void apiContext.twitch.getLiveStatus.invalidate();
    },
  });
  if (addCalendars.isIdle && follow.isIdle) {
    follow.mutate(undefined, {
      onError(error, variables, context) {
        console.log({ error, variables, context });
      },
      onSuccess: (count) => {
        console.log({ count });
        if (
          following?.data?.some(
            (streamer) =>
              new Date().getTime() -
                (streamer.calendar?.lastFetched.getTime() ?? 0) >
              // one day in millis
              86_400_000
          )
        )
          console.log("calling add calendar mutate");
        addCalendars.mutate();
      },
    });
  }

  const today = new Date();

  const formattedEvents = (following?.data ?? [])
    .filter((streamer) => streamer.isOnCalendar && streamer.isFavorite)
    .map(({ calendar, displayName, isOnCalendar, color }, number) => {
      if (calendar?.segments.length) {
        const firstThing = (calendar?.segments ?? []).map(
          ({ startTime, endTime, title }) => ({
            start: new Date(startTime),
            end: new Date(endTime),
            title: `${displayName}` + (title ? ": " + title : ""),
            streamerOrder: number,
            streamer: displayName,
            isOnCalendar,
            color: lightened(color || "purple"),
          })
        );
        return firstThing;
      }
      const thing = calendar?.unofficialSchedule?.unofficialDays.flatMap(
        (unofficialDay) => {
          return new RRule({
            freq: RRule.WEEKLY,
            byweekday: unofficialDay.day
              .toUpperCase()
              .slice(0, 2) as WeekdayStr,
            dtstart: new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              today.getDay()
            ),
            until: new Date(
              today.getFullYear(),
              today.getMonth() + 2,
              today.getDay()
            ),
          })
            .all()
            .map((date) => {
              const start = new Date(date);
              const end = new Date(date);
              start.setHours(unofficialDay?.start?.getHours() ?? 0);
              start.setMinutes(unofficialDay?.start?.getMinutes() ?? 0);
              end.setHours(unofficialDay?.end?.getHours() ?? 0);
              end.setMinutes(unofficialDay?.end?.getMinutes() ?? 0);
              return {
                start: start,
                end: end,
                title: displayName,
                streamerOrder: number,
                streamer: displayName,
                isOnCalendar: true,
                color: lightened(color || "purple"),
              };
            });
        }
      );
      return thing;
    })
    .flat()
    .filter(Boolean) as (Event & {
    streamer: string;
    streamerOrder: number;
    isOnCalendar: boolean;
    color: string;
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
              className: `border-2 rounded-md border-solid text-black shadow-lg`,
              style: event?.color
                ? {
                    backgroundColor: event.color,
                    borderColor: "black",
                  }
                : {},
            };
          }}
          className=""
        />
      </div>
    </>
  );
}
