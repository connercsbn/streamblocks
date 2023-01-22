import { TypeOf, z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const opts = {
  method: "GET",
  headers: {
    Authorization: "Bearer flgd79qqfjethh76d86h8v247znlbb",
    "Client-Id": "vpk2m43tbxjouwxk23phgsknh5b5xi",
  },
};

const users: Map<string, z.infer<typeof TwitchUserSchema>> = new Map();

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

const TwitchCalendarSchema = z
  .object({
    data: z
      .object({
        segments: z.array(
          z.object({
            id: z.string(),
            start_time: z.string().nullable(),
            end_time: z.string().nullable(),
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
        ),
      })
      .nullable(),
  })
  .nullable();

export type twitch_calendar_response = z.infer<typeof TwitchCalendarSchema>;

const calendar_fetch = async (
  param: string
): Promise<twitch_calendar_response> => {
  console.log(`param: ${param}`);
  const res = (
    await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${param}`,
      opts
    )
  ).json();
  return TwitchCalendarSchema.parse(await res);
};

const user_fetch = async (param: string): Promise<twitch_user> => {
  const res = (
    await fetch(`https://api.twitch.tv/helix/users?login=${param}`, opts)
  ).json();
  return TwitchUserSchema.parse(await res);
};

export const twitchRouter = createTRPCRouter({
  get_calendar: protectedProcedure
    .input(z.object({ streamer: z.string() }))
    .query(async ({ input: { streamer } }) => {
      console.log(streamer);
      const user = await user_fetch(streamer);
      return (await calendar_fetch(user.data[0].id))?.data?.segments;
    }),
});
