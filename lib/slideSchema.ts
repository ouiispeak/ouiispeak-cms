import { z } from "zod";

/**
 * Shared fields used by ALL slide types
 */
const baseSlide = z.object({
  id: z.string(),
  groupId: z.string(),
  orderIndex: z.number().int(),

  title: z.string(),
  instructions: z.string(),

  activityType: z.string() // will tighten later
});

/**
 * Slide Type 1: text display
 */
const textSlide = baseSlide.extend({
  slideType: z.literal("text"),
  activityType: z.literal("textDisplay"),
  props: z.object({
    lines: z.array(z.string()),
    mediaId: z.string().nullable(),
    audioId: z.string().nullable()
  })
});

/**
 * Slide Type 2: speak repeat
 */
const speakRepeatSlide = baseSlide.extend({
  slideType: z.literal("speak"),
  activityType: z.literal("speakRepeat"),
  props: z.object({
    promptAudioId: z.string(),
    transcript: z.string(),
    attemptsAllowed: z.number().int().default(1)
  })
});

/**
 * This is the FULL slide schema:
 * Zod will select the right schema based on slideType
 */
export const slideSchema = z.discriminatedUnion("slideType", [
  textSlide,
  speakRepeatSlide
]);

export type Slide = z.infer<typeof slideSchema>;
