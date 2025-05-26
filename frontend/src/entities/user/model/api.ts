import axiosInstance from '@/shared/api/axiosInstance';
import type { UserProfile } from './types';
import { apiClient } from '@/shared/api/axiosInstance';

// GET: 프로필 정보 불러오기
export async function getUserProfile(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/users/profile');
}

// PATCH: 프로필 정보 업데이트 (FormData 사용)
export async function updateUserProfile(formData: FormData): Promise<void> {
  await axiosInstance.patch('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    validateStatus: (status) => status >= 200 && status < 300, // 204도 허용
  });
}
