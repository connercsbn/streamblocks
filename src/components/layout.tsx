import type { PropsWithChildren } from "react";
import Head from "next/head";
import Nav from "./nav";

const Home: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Streamblocks</title>
        <meta
          name="description"
          content="Calendar for your favorite streamers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {children}
      </main>
    </>
  );
};

export default Home;
