import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const links = [
  { link: "/", name: "Home" },
  { link: "streaming-now", name: "Streaming Now" },
];

export default function Nav() {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="container m-2 flex justify-between  text-lg text-purple-200">
        <div className="gap-2">
          {links.map(({ link, name }, key) => (
            <Link
              className="relative inline-flex items-center rounded-lg border border-transparent py-2 px-3 text-purple-100 transition-colors hover:bg-purple-200/10 hover:text-purple-300 hover:no-underline"
              key={key}
              href={link}
            >
              {name}
            </Link>
          ))}
        </div>
        <div>
          {sessionData ? (
            <button
              className="self-end rounded-full bg-white/10 py-2 px-5 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          ) : (
            <button
              className="self-end rounded-full bg-white/10 py-2 px-5 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => void signIn()}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </>
  );
}
