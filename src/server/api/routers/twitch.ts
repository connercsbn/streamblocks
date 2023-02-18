import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { contextProps } from "@trpc/react-query/shared";

const opts = {
  method: "GET",
  headers: {
    Authorization: "Bearer 1qcw38klnib9a9ldpci632wu65fyu8",
    "Client-Id": "5f40c5goeja3illv2458wbvq2e9kbf",
  },
};

// const users: Map<string, z.infer<typeof TwitchUserSchema>> = new Map();

const TwitchLiveSchema = z.object({
  data: z
    .array(
      z
        .object({
          id: z.string().optional(),
          user_id: z.string().optional(),
          user_login: z.string().optional(),
          user_name: z.string().optional(),
          game_id: z.string().optional(),
          game_name: z.string().optional(),
          type: z.string().optional(),
          title: z.string().optional(),
          viewer_count: z.number().optional(),
          started_at: z.string().optional(),
          language: z.string().optional(),
          thumbnail_url: z.string().optional(),
          tag_ids: z.array(z.string()).nullish(),
          tags: z.array(z.string()).nullish(),
          is_mature: z.boolean().optional(),
        })
        .optional()
    )
    .optional(),
  pagination: z.object({ cursor: z.string().optional() }).optional(),
});
export type twitch_live_response = z.infer<typeof TwitchLiveSchema>;

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

const liveFetch = async (id: string): Promise<twitch_live_response> => {
  // console.log(`param for live_fetch: ${id}`);
  const res = (
    await fetch(`https://api.twitch.tv/helix/streams?user_id=${id}`, opts)
  ).json();
  return TwitchLiveSchema.parse(await res);
};

const followFetch = async (id: string): Promise<twitch_follow_response> => {
  // console.log(`param for follow_fetch: ${id}`);
  const res = (
    await fetch(
      `https://api.twitch.tv/helix/users/follows?from_id=${id}&first=100`,
      opts
    )
  ).json();
  return TwitchFollowSchema.parse(await res);
};

const calendarFetch = async (
  param: string
): Promise<twitch_calendar_response | undefined> => {
  // console.log(`param for calendar_fetch: ${param}`);
  const res = (
    await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${param}`,
      opts
    )
  ).json();
  const calendarData = TwitchCalendarSchema.safeParse(await res);
  if (!calendarData.success) {
    return;
  }
  return calendarData.data;
};

const userFetch = async (param: string): Promise<twitch_user> => {
  // console.log("param for user_fetch: ", param);
  const res = (
    await fetch(`https://api.twitch.tv/helix/users?id=${param}`, opts)
  ).json();
  return TwitchUserSchema.parse(await res);
};

export const twitchRouter = createTRPCRouter({
  getLiveStatus: protectedProcedure.query(async ({ ctx }) => {
    const schedules = (
      await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          streamers: true,
        },
      })
    ).streamers.map((streamer) => liveFetch(streamer.twitchId));
    return Promise.all(
      (await Promise.all(schedules))
        .filter((user) => user.data?.length)
        .map((streamer) =>
          streamer?.data?.map(async (status) => ({
            ...status,
            streamer: await ctx.prisma.streamer.findFirstOrThrow({
              where: { twitchId: status?.user_id },
            }),
          }))
        )
        .flat()
    );
  }),
  // addUnofficialCalendar: protectedProcedure.mutation(async ({ ctx }) => {
  //   const
  // }),
  addCalendars: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
    });
    const streamers = await ctx.prisma.streamer.findMany({
      where: { userId: user.id },
    });
    for (const streamer of streamers) {
      const segments =
        (await calendarFetch(streamer.twitchId))?.data?.segments?.map(
          ({ id, start_time, end_time, title }) => {
            return {
              segmentId: id,
              startTime: start_time,
              endTime: end_time,
              title,
            };
          }
        ) ?? [];
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          streamers: {
            update: {
              where: {
                id: streamer.id,
              },
              data: {
                calendar: {
                  create: {
                    segments: {
                      createMany: {
                        data: segments,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  }),
  getCalendar: protectedProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          streamers: { include: { calendar: { include: { segments: true } } } },
        },
      })
    )?.streamers.filter((streamer) => streamer.isFavorite);
  }),
  getFollowing: protectedProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          streamers: {
            include: {
              calendar: {
                select: {
                  _count: {
                    select: {
                      segments: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    )?.streamers;
  }),
  toggleOnCalendar: protectedProcedure
    .input(z.object({ streamerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const streamer = await ctx.prisma.streamer.findUniqueOrThrow({
        where: { id: input.streamerId },
      });
      await ctx.prisma.streamer.update({
        where: { id: input.streamerId },
        data: {
          isOnCalendar: !streamer.isOnCalendar,
        },
      });
    }),
  toggleFavorite: protectedProcedure
    .input(z.object({ streamerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const streamerToToggle = await ctx.prisma.streamer.findUniqueOrThrow({
        where: { id: input.streamerId },
      });
      await ctx.prisma.streamer.update({
        where: { id: streamerToToggle.id },
        data: { isFavorite: !streamerToToggle.isFavorite },
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
    ).streamers.map((streamer) => streamer.twitchId);
    const followingTwitch = (await followFetch(twitchId)).data.map(
      (streamer) => streamer.to_id
    );
    const notYetFollowingInDb = await Promise.all(
      followingTwitch
        .filter((streamer) => !followingDb.includes(streamer))
        .map((streamer) => userFetch(streamer))
    );
    const info = notYetFollowingInDb
      .flatMap((streamer) => streamer.data)
      .map(
        ({ description, display_name, id, profile_image_url, view_count }) => {
          return {
            twitchId: id,
            description,
            displayName: display_name,
            viewCount: view_count,
            imageUrl: profile_image_url,
          };
        }
      );
    await ctx.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        streamers: {
          createMany: {
            data: info,
          },
        },
      },
    });
  }),
});
