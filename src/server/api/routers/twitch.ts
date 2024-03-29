import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { extractColors } from "extract-colors";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import getPixels from "get-pixels";
import { InitiationState, type Streamer } from "@prisma/client";

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
  addUnofficialCalendar: protectedProcedure
    .input(
      z.object({
        streamerId: z.number(),
        unofficialSchedule: z.array(
          z.object({
            start: z.date().nullable(),
            end: z.date().nullable(),
            day: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input.unofficialSchedule);
      const filteredUnofficialSchedule = input.unofficialSchedule.filter(
        (sched) => sched.start && sched.end
      );
      const streamerHasUnofficialSchedule = (
        await ctx.prisma.streamer.findUniqueOrThrow({
          where: {
            id: input.streamerId,
          },
          include: {
            calendar: {
              include: {
                unofficialSchedule: true,
              },
            },
          },
        })
      ).calendar?.unofficialSchedule;

      if (streamerHasUnofficialSchedule) {
        const newUnofficialDays = await Promise.all(
          filteredUnofficialSchedule.map(async (day) => {
            return ctx.prisma.unofficialDay.create({
              data: {
                day: day.day,
                start: day.start,
                end: day.end,
              },
            });
          })
        );
        return await ctx.prisma.streamer.update({
          where: {
            id: input.streamerId,
          },
          data: {
            calendar: {
              update: {
                unofficialSchedule: {
                  update: {
                    unofficialDays: {
                      set: newUnofficialDays.map(({ id }) => ({ id })),
                    },
                  },
                },
              },
            },
          },
        });
      }
      const streamer = await ctx.prisma.streamer.findUniqueOrThrow({
        where: {
          id: input.streamerId,
        },
        include: {
          calendar: true,
        },
      });
      await ctx.prisma.streamer.update({
        where: {
          id: input.streamerId,
        },
        data: {
          calendar: {
            update: {
              unofficialSchedule: {
                create: {
                  unofficialDays: {
                    createMany: {
                      data: filteredUnofficialSchedule.map((day) => ({
                        day: day.day,
                        start: day.start,
                        end: day.end,
                      })),
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
  setColor: protectedProcedure
    .input(
      z.object({
        color: z.string(),
        streamerId: z.number(),
      })
    )
    .mutation(async ({ ctx, input: { color, streamerId } }) => {
      await ctx.prisma.streamer.update({
        where: {
          id: streamerId,
        },
        data: {
          color,
        },
      });
    }),
  addCalendar: protectedProcedure.mutation(async ({ ctx }) => {
    const currentProgress = await ctx.prisma.progress.findUniqueOrThrow({
      where: { userId: ctx.session.user.id },
      include: { streamersToAdd: true },
    });
    const currentStreamerToFetch = currentProgress.streamersToAdd.at(0);
    if (!currentStreamerToFetch || !currentStreamerToFetch?.id) {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          initiationState: "INITIATED",
        },
      });
      return false;
    }
    const segments =
      (
        await calendarFetch(currentStreamerToFetch.twitchId)
      )?.data?.segments?.map(({ id, start_time, end_time, title }) => {
        return {
          segmentId: id,
          startTime: start_time,
          endTime: end_time,
          title: title ?? "No title",
        };
      }) ?? [];
    console.log(currentStreamerToFetch.id);
    if (
      await ctx.prisma.calendar.findUnique({
        where: { streamerId: currentStreamerToFetch.id },
      })
    ) {
      throw (
        "Calendar already exists for this streamer: " +
        currentStreamerToFetch.displayName +
        ". " +
        JSON.stringify(
          currentProgress.streamersToAdd.map((streamer) => streamer.displayName)
        )
      );
    }

    await ctx.prisma.calendar.create({
      data: {
        streamerId: currentStreamerToFetch.id,
        segments: {
          createMany: {
            data: segments,
          },
        },
      },
    });
    console.log({
      set: currentProgress.streamersToAdd
        .filter((streamer) => streamer.id !== currentStreamerToFetch.id)
        .map((streamer) => ({ id: streamer.id })),
    });
    const ret = await ctx.prisma.progress.update({
      where: { userId: ctx.session.user.id },
      data: {
        streamersToAdd: {
          set: [
            ...currentProgress.streamersToAdd
              .filter((streamer) => streamer.id !== currentStreamerToFetch.id)
              .map((streamer) => ({ id: streamer.id })),
          ],
        },
        numStreamersAdded: currentProgress.numStreamersAdded + 1,
      },
      include: {
        streamersToAdd: true,
      },
    });
    console.log({ ret });
    return ret;
  }),
  addCalendars: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const streamers = await ctx.prisma.streamer.findMany({
      where: { userId },
      include: {
        calendar: true,
      },
    });
    let tmpCount = 0;
    for (const streamer of streamers) {
      if (
        new Date().getTime() - (streamer.calendar?.lastFetched.getTime() ?? 0) <
        86_400_000
      ) {
        continue;
      }
      await ctx.prisma.calendar.deleteMany({
        where: {
          streamerId: streamer.id,
        },
      });
      const segments =
        (await calendarFetch(streamer.twitchId))?.data?.segments?.map(
          ({ id, start_time, end_time, title }) => {
            return {
              segmentId: id,
              startTime: start_time,
              endTime: end_time,
              title: title ?? "No title",
            };
          }
        ) ?? [];
      console.log({ newSegments: segments });
      tmpCount++;
      console.log(
        `adding ${streamer.displayName} (${tmpCount}/${streamers.length})`
      );
      await ctx.prisma.user.update({
        where: { id: userId },
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
                        data: segments ?? [],
                      },
                    },
                    lastFetched: new Date(),
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
          streamers: {
            include: {
              calendar: {
                include: {
                  segments: true,
                },
              },
            },
          },
        },
      })
    )?.streamers.filter((streamer) => streamer.isFavorite);
  }),
  getInitiated: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.user.id,
      },
    });
    console.log(user);
    return user.initiationState;
  }),
  initiate: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.user.id,
      },
    });
    if (user.initiationState !== "UNINITIATED") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has already begun initiation",
      });
    }
    console.log("INITITATING");
    await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        initiationState: InitiationState.INITIATING,
      },
    });
  }),
  finishInitation: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.user.id,
      },
    });
    if (user.initiationState !== "INITIATING") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User needs to be initiating already",
      });
    }
    console.log("FINISHING INITIATION");
    await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        initiationState: InitiationState.INITIATED,
      },
    });
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
                  segments: true,
                  lastFetched: true,
                  unofficialSchedule: {
                    select: {
                      unofficialDays: true,
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
        data: { isFavorite: !streamerToToggle.isFavorite, isOnCalendar: true },
      });
    }),
  follow: protectedProcedure.mutation(async ({ ctx }) => {
    // if progress has streamers to go through and status is initiated then don't fetch and return early
    const userId = ctx.session.user.id;
    const { providerAccountId: twitchId } =
      await ctx.prisma.account.findFirstOrThrow({
        where: {
          userId: userId,
        },
      });
    const initiationState = (
      await ctx.prisma.user.findUnique({
        where: { id: userId },
      })
    )?.initiationState;
    // return early if user is still initiating and has already fetched the streamers they need
    if (initiationState !== "INITIATED") {
      if (
        (
          await ctx.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            include: { progress: true },
          })
        ).progress
      ) {
        return;
      }
    }
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
    const notYetUnfollowedInDb = followingDb.filter(
      (streamer) => !followingTwitch.includes(streamer)
    );
    console.log({ notYetUnfollowedInDb });
    if (notYetUnfollowedInDb) {
      await ctx.prisma.streamer.deleteMany({
        where: {
          AND: {
            twitchId: {
              in: notYetUnfollowedInDb,
            },
            userId: userId,
          },
        },
      });
    }

    const followsToAddPromise = notYetFollowingInDb
      .flatMap((streamer) => streamer.data)
      .map(
        async ({
          description,
          display_name,
          id,
          profile_image_url,
          view_count,
        }) => {
          const color: string =
            (await new Promise((res, rej) => {
              getPixels(profile_image_url, (err, pixels) => {
                if (!pixels?.data) {
                  rej("no pixel data");
                }
                if (err) {
                  rej(err);
                }
                try {
                  const data = [...pixels.data];
                  const width = Math.round(Math.sqrt(data.length / 4));
                  const height = width;
                  extractColors({ data, width, height })
                    .then((finalColor) => {
                      const sortedColors = finalColor.sort(
                        (a, b) => b.area - a.area
                      );
                      const nonSkinToneColor = sortedColors.find(
                        ({ hue }) => hue < 8 && hue > 40
                      )?.hex;
                      res(
                        nonSkinToneColor || sortedColors.at(0)?.hex || "purple"
                      );
                    })
                    .catch(rej);
                } catch (e) {
                  rej(e);
                }
              });
            })) || "purple";
          return {
            userId,
            twitchId: id,
            description,
            displayName: display_name,
            viewCount: view_count,
            imageUrl: profile_image_url,
            color,
          };
        }
      );
    const followsToAdd = (
      (await Promise.allSettled(followsToAddPromise)).filter(
        (res) => res.status === "fulfilled"
      ) as PromiseFulfilledResult<Streamer>[]
    ).map((val) => val.value);
    await ctx.prisma.streamer.createMany({
      data: followsToAdd,
    });
    const streamersToAdd = await ctx.prisma.streamer.findMany({
      where: { userId: userId },
    });
    if (initiationState !== "INITIATED") {
      await ctx.prisma.progress.create({
        data: {
          userId: userId,
          numStreamersToAdd: streamersToAdd.length,
          numStreamersAdded: 0,
          message: "I don't know what to put here.",
          streamersToAdd: {
            connect: streamersToAdd.map((streamer) => ({ id: streamer.id })),
          },
        },
      });
    }
  }),
});
