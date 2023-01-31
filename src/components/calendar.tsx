import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { type PropsWithChildren } from "react";
import type { Event } from "react-big-calendar";
import { type RouterOutputs } from "../utils/api";
import overlapfunction from "../utils/overlap";

const localizer = momentLocalizer(moment);

export default function MyCalendar({
  events,
}: PropsWithChildren<{ events: RouterOutputs["twitch"]["getCalendar"] }>) {
  const things = events
    .flatMap(({ calendar, streamer_name }) =>
      calendar?.data?.segments?.map((segment) => {
        return {
          start: new Date(segment.start_time),
          end: new Date(segment.end_time),
          title: streamer_name + (segment.title ? ": " + segment.title : ""),
        };
      })
    )
    .filter(Boolean) as Event[];
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

  return (
    <div className="w-full bg-white">
      <Calendar
        defaultView="week"
        localizer={localizer}
        events={things.reverse()}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 800 }}
        dayLayoutAlgorithm={overlapfunction}
      />
    </div>
  );
}
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";

// const events = [{ title: "Meeting", start: new Date() }];

// export default function Calendar() {
//   return (
//     <div className="w-full">
//       <h1 className="text-3xl text-white">Calendar</h1>
//       <FullCalendar
//         plugins={[dayGridPlugin]}
//         initialView="dayGridWeek"
//         eventTextColor="#ff0000"
//         eventBorderColor="red"
//         eventColor="yellow"
//         eventBackgroundColor="gray"
//         weekends={true}
//         events={events}
//         eventContent={renderEventContent}

//       />
//     </div>
//   );
// }

// // a custom render function
// function renderEventContent(eventInfo: {
//   timeText: string;
//   event: { title: string };
// }) {
//   return (
//     <>
//       <b>{eventInfo.timeText}</b>
//       <i>{eventInfo.event.title}</i>
//     </>
//   );
// }
