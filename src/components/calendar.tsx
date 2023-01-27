import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { PropsWithChildren } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { type Event } from "react-big-calendar";
import { twitch_calendar_response } from "../server/api/routers/twitch";

const localizer = momentLocalizer(moment);

export default function MyCalendar(
  props: PropsWithChildren<{ events: twitch_calendar_response[] }>
) {
  const events = props.events
    .flatMap((event) =>
      event?.data?.segments?.map((segment) => {
        return {
          start: new Date(segment.start_time),
          end: new Date(segment.end_time),
          title: segment.title,
        };
      })
    )
    .filter(Boolean) as Event[];

  return (
    <div className="w-full bg-white">
      <Calendar
        defaultView="week"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 800 }}
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
