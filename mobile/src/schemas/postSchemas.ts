import { z } from 'zod';

export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(4096, 'Telegram text messages cannot exceed 4096 characters'),
  channelIds: z
    .array(z.string())
    .min(1, 'Select at least one destination channel'),
  formattingMode: z.enum(['HTML', 'MARKDOWN', 'PLAIN']).default('HTML'),
  pinMessage: z.boolean().default(false),
  scheduledFor: z.string().nullable().optional(),
  mediaAttachments: z
    .array(
      z.object({
        media_url: z.string().url(),
        media_type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
        file_size: z.number().optional(),
        order: z.number().optional(),
      })
    )
    .max(10, 'Telegram allows a maximum of 10 media items in an album')
    .default([]),
});

export type PostFormValues = z.infer<typeof postSchema>;
