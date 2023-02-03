import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";

const links = [
  { link: "/", name: "Home" },
  { link: "streaming-now", name: "Streaming Now" },
];

export default function Nav() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const activeClasses =
    "mx-1 relative inline-flex items-center rounded-md border border-transparent px-2 py-1 transition-colors hover:no-underline border bg-purple-200/50 text-purple-800 dark:border-purple-200/20 dark:bg-purple-200/10 dark:hover:border-purple-200/50 rounded-lg text-purple-800 hover:bg-purple-200/50 hover:text-purple-800 dark:text-purple-100 dark:hover:bg-purple-200/10 dark:hover:text-purple-300";
  const inactiveClasses =
    "mx-1 relative inline-flex items-center rounded-lg border border-transparent py-1 px-2 text-purple-100 transition-colors hover:bg-purple-200/10 hover:text-purple-300 hover:no-underline";
  return (
    <>
      <div className="flex h-14 w-full justify-between self-center px-2 text-lg font-normal text-purple-200">
        <div className="self-center">
          {links.map(({ link, name }, key) => (
            <Link
              className={
                router.asPath == link ? activeClasses : inactiveClasses
              }
              key={key}
              href={link}
            >
              {name}
            </Link>
          ))}
        </div>
        <div className="self-center">
          {sessionData ? (
            <button
              className="self-end rounded-full bg-white/10 py-1 px-4 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          ) : (
            <button
              className="self-end rounded-full bg-white/10 py-1 px-4 font-semibold text-white no-underline transition hover:bg-white/20"
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
