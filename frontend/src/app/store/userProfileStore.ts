import { create } from 'zustand';
import { Gender, Age, MBTI } from '@/shared/consts/enum';
import { persist } from 'zustand/middleware';

interface ProfileState {
  nickname: string;
  age: Age;
  gender: Gender;
  career: string;
  mbti: MBTI;
  profileImage: File | null; // 업로드 전 임시 파일
  profileImageUrl: string | null; // 서버 업로드 후 URL (선택)
  setNickname: (nickname: string) => void;
  setAge: (age: Age) => void;
  setGender: (gender: Gender) => void;
  setCareer: (career: string) => void;
  setMbti: (mbti: MBTI) => void;
  setProfileImage: (file: File | null) => void;
  setProfileImageUrl: (url: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      nickname: '',
      age: Age.UNKNOWN,
      gender: Gender.UNKNOWN,
      career: '',
      mbti: MBTI.UNKNOWN,
      profileImage: null,
      profileImageUrl: null,
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
    }),
    {
      name: 'user-profile-store', // localStorage key 이름
      partialize: (state) => ({
        nickname: state.nickname,
        age: state.age,
        gender: state.gender,
        career: state.career,
        mbti: state.mbti,
        profileImageUrl: state.profileImageUrl,
      }),
    }
  )
);
