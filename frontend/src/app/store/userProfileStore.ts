import { create } from 'zustand';
import { Gender, Age, MBTI } from '@/shared/consts/enum';

interface ProfileState {
  nickname: string;
  age: Age | '';
  gender: Gender | '';
  career: string;
  mbti: MBTI | '';
  profileImage: File | null; // 업로드 전 임시 파일
  profileImageUrl: string | null; // 서버 업로드 후 URL (선택)
  setNickname: (nickname: string) => void;
  setAge: (age: Age | '') => void;
  setGender: (gender: Gender | '') => void;
  setCareer: (career: string) => void;
  setMbti: (mbti: MBTI | '') => void;
  setProfileImage: (file: File | null) => void;
  setProfileImageUrl: (url: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  nickname: '',
  age: '',
  gender: '',
  career: '',
  mbti: '',
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
      age: '',
      gender: '',
      career: '',
      mbti: '',
      profileImage: null,
      profileImageUrl: null,
    }),
}));
