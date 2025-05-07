import { z } from 'zod';

export const profileSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
  profileImage: z.string().optional(), // 이미지 URL 또는 base64
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']),
  age: z.enum(['UNKOWN', 'TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES', 'OVER']),
  career: z.string().optional(),
  mbti: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
