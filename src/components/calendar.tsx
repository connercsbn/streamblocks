import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { PropsWithChildren } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { type Event } from "react-big-calendar";

const localizer = momentLocalizer(moment);

export default function MyCalendar(
  props: PropsWithChildren<{ events: Event[][] }>
) {
  console.log(props.events);
  return (
    <div className="w-full bg-white">
      <Calendar
        defaultView="week"
        localizer={localizer}
        events={props.events}
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
