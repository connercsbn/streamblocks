import { PropsWithChildren } from "react";

function TimePicker({
  day,
  added,
  toggleDay,
}: {
  day: string;
  added: boolean;
  toggleDay: (day: string, time?: Date) => void;
}) {
  return (
    <>
      <div className="mx-auto flex w-2/3 items-center justify-around py-2">
        <div className="w-40">
          <input
            id={day}
            onChange={() => toggleDay(day, added ? undefined : new Date())}
            checked={added}
            type="checkbox"
            value={day}
          ></input>
          <label className="mx-2" htmlFor={day}>
            {day}
          </label>
        </div>
        <div
          className={`flex items-center rounded-md border p-2 text-lg shadow-lg ${
            added ? "border-white" : "border-gray-600 text-gray-600"
          }`}
        >
          <Clock disabled={!added} timeSlot="day" />
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
          <Clock disabled={!added} timeSlot="night" />
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
}: PropsWithChildren<{ disabled: boolean; timeSlot: string }>) => {
  return (
    <>
      <select
        disabled={disabled}
        name=""
        id=""
        className=" appearance-none bg-transparent"
        defaultValue={timeSlot === "day" ? "9:00" : "5:00"}
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
        id=""
        className=" appearance-none bg-transparent"
      >
        {timeSlot === "day" ? (
          <>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </>
        ) : (
          <>
            <option value="PM">PM</option>
            <option value="AM">AM</option>
          </>
        )}
      </select>
    </>
  );
};
