import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const opts = {
  method: "GET",
  headers: {
    Authorization: "Bearer 1qcw38klnib9a9ldpci632wu65fyu8",
    "Client-Id": "5f40c5goeja3illv2458wbvq2e9kbf",
  },
};

// const users: Map<string, z.infer<typeof TwitchUserSchema>> = new Map();

const TwitchUserSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.string(),
        login: z.string(),
        display_name: z.string(),
        broadcaster_type: z.string(),
        description: z.string(),
        profile_image_url: z.string(),
        view_count: z.number(),
        created_at: z.string(),
      })
    )
    .nonempty(),
});
export type twitch_user = z.infer<typeof TwitchUserSchema>;

const TwitchFollowSchema = z.object({
  total: z.number(),
  data: z.array(
    z.object({
      from_id: z.string(),
      from_login: z.string(),
      from_name: z.string(),
      to_id: z.string(),
      to_login: z.string(),
      to_name: z.string(),
      followed_at: z.string(),
    })
  ),
});
export type twitch_follow_response = z.infer<typeof TwitchFollowSchema>;

const TwitchCalendarSchema = z
  .object({
    data: z
      .object({
        segments: z
          .array(
            z.object({
              id: z.string(),
              start_time: z.string(),
              end_time: z.string(),
              title: z.string().nullable(),
              canceled_until: z.string().nullable(),
              category: z
                .object({
                  id: z.string().nullable(),
                  name: z.string().nullable(),
                })
                .nullable(),
              is_recurring: z.boolean(),
            })
          )
          .nonempty()
          .nullable(),
      })
      .nullable(),
  })
  .nullable();

export type twitch_calendar_response = z.infer<typeof TwitchCalendarSchema>;
export type twitch_calendar_error = z.inferFormattedError<
  typeof TwitchCalendarSchema
>;

const follow_fetch = async (id: string): Promise<twitch_follow_response> => {
  console.log(`param for follow_fetch: ${id}`);
  const res = (
    await fetch(
      `https://api.twitch.tv/helix/users/follows?from_id=${id}&first=100`,
      opts
    )
  ).json();
  console.log(await res);
  return TwitchFollowSchema.parse(await res);
};

const calendar_fetch = async (
  param: string
): Promise<twitch_calendar_response | undefined> => {
  console.log(`param for calendar_fetch: ${param}`);
  const res = (
    await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${param}`,
      opts
    )
  ).json();
  const calendarData = TwitchCalendarSchema.safeParse(await res);
  if (!calendarData.success) {
    console.log(calendarData.error.format());
    return;
  }
  return calendarData.data;
};

const user_fetch = async (param: string): Promise<twitch_user> => {
  console.log("param for user_fetch: ", param);
  const res = (
    await fetch(`https://api.twitch.tv/helix/users?id=${param}`, opts)
  ).json();
  return TwitchUserSchema.parse(await res);
};

export const twitchRouter = createTRPCRouter({
  getCalendar: protectedProcedure
    .input(z.object({ streamer_ids: z.array(z.string()) }))
    .query(async ({ input: { streamer_ids }, ctx }) => {
      const streamersWithoutCalendars = [] as string[];
      const streamerCalendars = [] as (twitch_calendar_response | undefined)[];
      for (const streamer_id of streamer_ids) {
        const tempCal = await calendar_fetch(streamer_id);
        if (tempCal?.data?.segments) {
          streamerCalendars.push(tempCal);
        } else {
          streamersWithoutCalendars.push(streamer_id);
        }
      }
      console.log(
        "streamers without calendars: ",
        (
          await ctx.prisma.streamer.findMany({
            where: {
              id: {
                in: streamersWithoutCalendars,
              },
            },
          })
        ).map((streamer) => streamer.display_name)
      );
      return streamerCalendars;
    }),
  getTopEight: protectedProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          topEight: true,
        },
      })
    )?.topEight;
  }),
  getFollowing: protectedProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          streamers: true,
        },
      })
    )?.streamers;
  }),
  reformatTopEight: protectedProcedure
    .input(z.object({ streamer_ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const usersToAdd = await ctx.prisma.streamer.findMany({
        where: {
          id: {
            in: input.streamer_ids,
          },
        },
      });
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          topEight: {
            connect: usersToAdd,
          },
        },
      });
    }),
  addToTopEight: protectedProcedure
    .input(z.object({ streamer_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          topEight: {
            connect: {
              id: input.streamer_id,
            },
          },
        },
      });
    }),
  follow: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const { providerAccountId: twitchId } =
      await ctx.prisma.account.findFirstOrThrow({
        where: {
          userId: userId,
        },
      });
    const followingDb = (
      await ctx.prisma.user.findFirstOrThrow({
        where: { id: userId },
        include: { streamers: true },
      })
    ).streamers.map((streamer) => streamer.id);
    const followingTwitch = (await follow_fetch(twitchId)).data.map(
      (streamer) => streamer.to_id
    );
    const notYetFollowingInDb = await Promise.all(
      followingTwitch
        .filter((streamer) => !followingDb.includes(streamer))
        .map((streamer) => user_fetch(streamer))
    );
    const info = notYetFollowingInDb
      .flatMap((streamer) => streamer.data)
      .map(
        ({ description, display_name, id, profile_image_url, view_count }) => {
          return {
            create: {
              id,
              description,
              display_name,
              view_count,
              image_url: profile_image_url,
            },
            where: {
              id,
            },
          };
        }
      );
    await ctx.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        streamers: {
          connectOrCreate: info,
        },
      },
    });
  }),
});
