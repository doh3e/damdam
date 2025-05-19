// store/userProfileStore.ts
import { create } from 'zustand';
import { Gender, Age, MBTI } from '@/shared/consts/enum';
import { UserProfile } from '@/entities/user/model/types';

interface ProfileState {
  nickname: string;
  age: Age;
  gender: Gender;
  career: string;
  mbti: MBTI;
  profileImage: File | null;
  profileImageUrl: string | null;
  setNickname: (nickname: string) => void;
  setAge: (age: Age) => void;
  setGender: (gender: Gender) => void;
  setCareer: (career: string) => void;
  setMbti: (mbti: MBTI) => void;
  setProfileImage: (file: File | null) => void;
  setProfileImageUrl: (url: string | null) => void;
  syncFromServer: (data: UserProfile) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  nickname: '',
  age: Age.UNKNOWN,
  gender: Gender.UNKNOWN,
  career: '',
  mbti: MBTI.UNKNOWN,
  profileImage: null,
  profileImageUrl: null,

  syncFromServer: (data) =>
    set({
      nickname: data.nickname,
      age: data.age,
      gender: data.gender,
      career: data.career,
      mbti: data.mbti,
      profileImageUrl: data.profileImage,
    }),

  setNickname: (nickname) => set({ nickname }),
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setCareer: (career) => set({ career }),
  setMbti: (mbti) => set({ mbti }),
  setProfileImage: (file) => set({ profileImage: file }),
  setProfileImageUrl: (url) => set({ profileImageUrl: url }),

  reset: () =>
    set({
      nickname: '',
      age: Age.UNKNOWN,
      gender: Gender.UNKNOWN,
      career: '',
      mbti: MBTI.UNKNOWN,
      profileImage: null,
      profileImageUrl: null,
    }),
}));
