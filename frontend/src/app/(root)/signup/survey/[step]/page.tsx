'use client';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { surveySections } from '@/shared/consts/surveyQuestions';
import { useSurveyStore } from '@/app/store/surveyStore';
import { useState } from 'react';
import { generateSurveyResult } from '@/shared/types/survey';
import Modal from '@/shared/ui/modal';

export default function SurveyStepPage() {
  const router = useRouter(); // 페이지 이동 함수
  const { step } = useParams(); // 동적 라우팅의 step 값을 가져옴 (문자열 1,2,3)
  const stepIdx = Number(step) - 1; // 배열 index에 맞게 숫자로 변환
  const section = surveySections[stepIdx]; // step에 해당하는 설문지

  // Zustand 등에서 답변 상태 관리
  const { answers, setAnswer, reset } = useSurveyStore();

  // 답변 점수 변경 핸들러
  const handleScoreChange = (qIdx: number, score: number) => {
    setAnswer(stepIdx, qIdx, score);
  };

  // step 이동 핸들러
  const handlePrev = () => {
    if (stepIdx > 0) router.push(`/signup/survey/${stepIdx}`);
  };
  const handleNext = () => {
    if (stepIdx < surveySections.length - 1) {
      router.push(`/signup/survey/${stepIdx + 2}`);
    }
  };

  // 제출 모달
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalSubMessage, setModalSubMessage] = useState<string | null>(null);

  const handleSurveySubmit = async () => {
    const isAllAnswered = surveySections.every((section, i) => {
      const stepAnswers = answers[i] || [];
      return section.questions.every((_, qIdx) => stepAnswers[qIdx] !== undefined);
    });
    if (!isAllAnswered) {
      setModalMessage('잠시만요!');
      setModalSubMessage('잠시만요! 아직 답변하지 않은 문항이 있어요');
      return;
    }
    const result = generateSurveyResult(answers, surveySections);
    try {
      await axios.post('/users/survey', result);
      setModalMessage('설문에 답해주셔서 감사해요!');
      setModalSubMessage('이제 담담이는 회원님에 대해 더 잘 이해했어요!');
      reset();
    } catch (err) {
      setModalMessage('제출에 실패했습니다!');
      setModalSubMessage('잠시 후 다시 시도해주세요');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-2">
      <div className="w-full max-w-xl bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-2">
          마음 상태 설문 ({step}/{surveySections.length})
        </h2>
        <p className="text-xs text-gray-500 mb-4">{section.description}</p>
        <form>
          {section.questions.map((q, qIdx) => (
            <div key={q.id} className="mb-5">
              <div className="mb-2 text-base text-gray-800">{q.text}</div>
              <div className="flex justify-center gap-10">
                {section.options.map((opt) => (
                  <label key={opt.value} className="flex flex-col mt-3 min-w-[70px] items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`q${step}_${qIdx}`}
                      checked={answers[stepIdx]?.[qIdx] === opt.value}
                      onChange={() => handleScoreChange(qIdx, opt.value)}
                      className="accent-orange-400"
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
              <hr className="my-6 border-t border-gray-200" />
            </div>
          ))}
        </form>
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            className={`px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold ${stepIdx === 0 ? 'invisible' : ''}`}
            type="button"
          >
            이전
          </button>
          {stepIdx < surveySections.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded bg-orange-500 text-white font-semibold"
              type="button"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSurveySubmit}
              className="px-4 py-2 rounded bg-orange-500 text-white font-semibold"
              type="button"
            >
              설문완료
            </button>
          )}
          {modalMessage && (
            <Modal
              message={modalMessage}
              submessage={modalSubMessage || ''}
              onClose={() => {
                setModalMessage(null);
                setModalSubMessage(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
