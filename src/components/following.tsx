import type { Streamer } from "@prisma/client";
import StreamerInList from "./streamerInList";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { type RouterOutputs } from "../utils/api";
import { api } from "../utils/api";

export const Following: React.FC<{
  big: boolean;
  handleToggleFavorite: (streamerId: number) => void;
}> = ({ big, handleToggleFavorite: handleToggleStreamer }) => {
  const [searchInput, setSearchInput] = useState("");

  const following = api.twitch.getFollowing.useQuery();

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value);
  };

  const searchFilter = (streamer: Streamer) => {
    return streamer.displayName
      .toLowerCase()
      .includes(searchInput.toLowerCase());
  };
  const regulars = following?.data
    ?.filter((streamer) => !streamer.isFavorite)
    .filter(searchFilter);
  return (
    <>
      {big && (
        <div className="my-2 px-4">
          <SearchBar searchInput={searchInput} handleInput={handleInput} />
        </div>
      )}
      <div className={`my-2 ${big ? "" : "w-full"}`}>
        {regulars
          ?.filter(
            (streamer) =>
              !!streamer.calendar?.segments.length ||
              !!streamer.calendar?.unofficialSchedule?.unofficialDays.length
          )
          .map((streamer, key) => (
            <StreamerInList
              streamer={streamer}
              key={key}
              size={big ? "full" : "mini"}
              handleToggleFavorite={handleToggleStreamer}
            />
          ))}
        <div className="my-3 border-[1px] border-dashed border-yellow-300/20"></div>
        {regulars
          ?.filter(
            (streamer) =>
              !streamer.calendar?.segments.length &&
              !streamer.calendar?.unofficialSchedule?.unofficialDays.length
          )
          .map((streamer, key) => (
            <StreamerInList
              streamer={streamer}
              key={streamer.id}
              size={big ? "full" : "mini"}
              handleToggleFavorite={handleToggleStreamer}
            />
          ))}
      </div>
    </>
  );
};

const SearchBar = ({
  searchInput,
  handleInput,
}: {
  searchInput: string;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <>
    <label
      htmlFor="default-search"
      className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      Search
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        value={searchInput}
        onChange={handleInput}
        type="search"
        id="default-search"
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="Search"
        required
      />
    </div>
  </>
);

export default Following;
