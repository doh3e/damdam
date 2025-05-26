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

  // 개별 setter
  setNickname: (nickname: string) => void;
  setAge: (age: Age) => void;
  setGender: (gender: Gender) => void;
  setCareer: (career: string) => void;
  setMbti: (mbti: MBTI) => void;
  setProfileImage: (file: File | null) => void;
  setProfileImageUrl: (url: string | null) => void;

  // 통합 setter
  setProfile: (profile: Partial<ProfileState>) => void;

  // 초기화
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

      // 통합 setter
      setProfile: (profile) => set((state) => ({ ...state, ...profile })),

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
      name: 'user-profile-store',
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
