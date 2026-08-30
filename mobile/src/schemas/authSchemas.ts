import { z } from 'zod';

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^\+[1-9]\d{6,18}$/, 'Enter a valid phone number with country code (e.g. +1234567890)'),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .min(5, 'Telegram code must be at least 5 digits')
    .max(6, 'Telegram code is at most 6 digits')
    .regex(/^\d+$/, 'Code must contain digits only'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const passwordSchema = z.object({
  password: z
    .string()
    .min(1, 'Telegram 2FA cloud password is required'),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;
