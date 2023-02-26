import type { PropsWithChildren } from "react";
import { useState, useEffect } from "react";
function TimePicker({
  days,
  day,
  handleSetDays,
  handleToggle,
}: {
  days: {
    day: string;
    start: Date | null;
    end: Date | null;
    enabled: boolean;
  }[];
  day: {
    day: string;
    start: Date | null;
    end: Date | null;
    enabled: boolean;
  };
  handleSetDays: (day: string, start: Date | null, end: Date | null) => void;
  handleToggle: (day: string) => void;
}) {
  const added = day.enabled;
  return (
    <>
      <div className="mx-auto flex w-2/3 items-center justify-around py-2">
        <div className="w-40">
          <input
            id={day.day}
            onChange={(e) => handleToggle(day.day)}
            checked={added}
            type="checkbox"
          ></input>
          <label className="mx-2" htmlFor={day.day}>
            {day.day}
          </label>
        </div>
        <div
          className={`flex items-center rounded-md border p-2 text-lg shadow-lg ${
            added ? "border-white" : "border-gray-600 text-gray-600"
          }`}
        >
          <Clock
            disabled={!added}
            timeSlot="day"
            day={day}
            handleSetDays={handleSetDays}
          />
        </div>
        <div
          className={`mx-2 block h-0.5 w-3 ${
            added ? "bg-white" : "bg-gray-600"
          }`}
        ></div>
        <div
          className={`flex items-center rounded-md border p-2 text-lg shadow-lg ${
            added ? "border-white" : "border-gray-600 text-gray-600"
          }`}
        >
          <Clock
            disabled={!added}
            timeSlot="night"
            day={day}
            handleSetDays={handleSetDays}
          />
        </div>
      </div>
      {/* <div className="mx-auto h-[1px] w-3/4 bg-slate-500"></div> */}
    </>
  );
}
export default TimePicker;

const Clock = ({
  disabled,
  timeSlot,
  day,
  handleSetDays,
}: PropsWithChildren<{
  disabled: boolean;
  timeSlot: string;
  day: {
    day: string;
    start: Date | null;
    end: Date | null;
    enabled: boolean;
  };
  handleSetDays: (day: string, start: Date | null, end: Date | null) => void;
}>) => {
  const formatted = (date: Date | null) => {
    if (!date) {
      return null;
    }
    return {
      time: `${date.getHours() % 12 || 12}:${date
        .getMinutes()
        .toString()
        .padEnd(2, "0")}`,
      meridiem: date.getHours() > 11 ? "PM" : "AM",
    };
  };
  const formattedStart = formatted(day.start);
  const formattedEnd = formatted(day.end);

  const [time, setTime] = useState(
    timeSlot === "day"
      ? formattedStart?.time || "9:00"
      : formattedEnd?.time || "5:00"
  );

  const [meridiem, setMeridiem] = useState(
    timeSlot === "day"
      ? formattedStart?.meridiem ?? "AM"
      : formattedEnd?.meridiem ?? "PM"
  );

  const [totalTime, setTotalTime] = useState(
    timeSlot === "day" ? day.start : day.end
  );

  useEffect(() => {
    const newDate = new Date(0, 0, 0);
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === undefined || minutes === undefined)
      throw "on change error, couldn't save, don't know why";
    if (meridiem === "PM") {
      hours = hours + 12;
      minutes = minutes;
    }
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setTotalTime(newDate);
  }, [time, meridiem]);

  useEffect(() => {
    if (timeSlot === "day") {
      handleSetDays(day.day, totalTime, null);
    }
    if (timeSlot === "night") {
      handleSetDays(day.day, null, totalTime);
    }
  }, [totalTime, day, totalTime]);

  return (
    <>
      <select
        disabled={disabled}
        name=""
        id=""
        className="appearance-none bg-transparent"
        value={formatted(timeSlot === "day" ? day.start : day.end)?.time}
        onChange={(e) => {
          setTime(e.target.value);
        }}
      >
        {new Array(48)
          .fill(undefined)
          .map((_, num) => num * 15)
          .map((num) => (
            <option
              key={num}
              value={
                (Math.floor(num / 60) + 1).toString() +
                ":" +
                (num % 60).toString().padEnd(2, "0")
              }
            >
              {(Math.floor(num / 60) + 1).toString() +
                ":" +
                (num % 60).toString().padEnd(2, "0")}
            </option>
          ))}
      </select>
      <select
        disabled={disabled}
        name=""
        onChange={(e) => setMeridiem(e.target.value)}
        id=""
        value={meridiem}
        className=" appearance-none bg-transparent"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </>
  );
};
