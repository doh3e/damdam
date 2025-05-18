import axiosInstance from '@/shared/api/axiosInstance';
import { Gender, Age, MBTI } from '@/shared/consts/enum';

export interface UserProfile {
  provider: string;
  nickname: string;
  email: string;
  profileImage: string;
  gender: Gender;
  age: Age;
  career: string;
  mbti: MBTI;
}

// GET: 프로필 정보 불러오기
export async function getUserProfile(): Promise<UserProfile> {
  const res = await axiosInstance.get('/users/profile');
  return res.data;
}

// PATCH: 프로필 정보 업데이트 (FormData 사용)
export async function updateUserProfile(formData: FormData): Promise<void> {
  await axiosInstance.patch('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
