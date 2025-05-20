import axiosInstance from '@/shared/api/axiosInstance';
import type { UserProfile } from './types';

// GET: 프로필 정보 불러오기
export async function getUserProfile(): Promise<UserProfile> {
  const res = await axiosInstance.get<UserProfile>('/users/profile');
  return res.data;
}

// PATCH: 프로필 정보 업데이트 (FormData 사용)
export async function updateUserProfile(formData: FormData): Promise<UserProfile | null> {
  const res = await axiosInstance.patch('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    validateStatus: (status) => status >= 200 && status < 300, // 204도 허용
  });

  // 204 No Content → 본문이 없음
  if (res.status === 204) return null;

  return res.data;
}
