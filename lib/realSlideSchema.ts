import { z } from "zod";

/**
 * Mirror of SpeechContent (simplified: SupportedLang -> string)
 */
export const speechContentSchema = z.object({
  mode: z.enum(["tts", "file"]),
  lang: z.string().optional(),
  text: z.string().optional(),
  fileUrl: z.string().optional(),
});

/**
 * Mirror of AiSpeakRepeatCell
 */
export const aiSpeakRepeatCellSchema = z.object({
  label: z.string(),
  speech: speechContentSchema,
});

/**
 * Mirror of AiSpeakRepeatSlideProps (without function fields)
 */
export const aiSpeakRepeatSlidePropsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  note: z.string().optional(),
  defaultLang: z.string().optional(),
  // lines: AiSpeakRepeatCell[][]
  lines: z.array(z.array(aiSpeakRepeatCellSchema)),
  gapClass: z.string().optional(),
  hideTitle: z.boolean().optional(),
  onCompleteAtIndex: z.number().int().optional(),
});

/**
 * BaseSlide<T, P> for T = "ai-speak-repeat"
 */
export const aiSpeakRepeatSlideSchema = z.object({
  id: z.string(),
  groupId: z.string().optional(),
  type: z.literal("ai-speak-repeat"),
  props: aiSpeakRepeatSlidePropsSchema,
  aidHook: z.string().nullable().optional(),
});

export type RealAiSpeakRepeatSlide = z.infer<typeof aiSpeakRepeatSlideSchema>;
