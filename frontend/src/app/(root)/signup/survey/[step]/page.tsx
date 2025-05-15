'use client';
import { useRouter, useParams } from 'next/navigation';
import { surveySections } from '@/shared/consts/surveyQuestions';
import { useSurveyStore } from '@/app/store/surveyStore';
import { useState } from 'react';
import { generateSurveyResult } from '@/shared/types/survey';
import Modal from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import axiosInstance from '@/shared/api/axiosInstance';

export default function SurveyStepPage() {
  const router = useRouter(); // 페이지 이동 함수
  const { step } = useParams(); // 동적 라우팅의 step 값을 가져옴 (문자열 1,2,3)
  const stepIdx = Number(step) - 1; // 배열 index에 맞게 숫자로 변환
  const section = surveySections[stepIdx]; // step에 해당하는 설문지

  // Zustand 등에서 답변 상태 관리
  const { answers, stressReason, setStressReason, setAnswer, reset } = useSurveyStore();

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

  // 모달 상태
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalSubMessage, setModalSubMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

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
    const result = generateSurveyResult(answers, surveySections, stressReason);
    try {
      await axiosInstance.post('/users/survey', result);
      setModalMessage('설문에 답해주셔서 감사해요!');
      setModalSubMessage('이제 담담이는 회원님에 대해 더 잘 이해했어요!');
      router.push('/');
      console.log(result);

      reset();
    } catch (err) {
      setModalMessage('제출에 실패했습니다!');
      setModalSubMessage('잠시 후 다시 시도해주세요');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-2">
      <div className="w-full max-w-xl bg-white rounded-xl shadow p-6 relative">
        {/* 사전설문 질문 문구 */}
        <h2 className="text-lg font-bold mb-2">
          마음 상태 설문 ({step}/{surveySections.length})
        </h2>
        <p className="text-xl text-gray-900 mb-4 leading-relaxed">
          📝
          <span className="font-bold text-orange-500 whitespace-nowrap">최근 2주간</span>
          동안 다음의 문제들로 얼마나 자주 방해를 받았나요?
        </p>
        {/* 사전설문 선택지 */}
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
        {/* 텍스트 입력 페이지 */}
        {stepIdx === surveySections.length - 1 && (
          <div className="mb-5">
            <textarea
              id="stressReason"
              className="w-full min-h-[160px] p-2 border rounded"
              value={stressReason}
              onChange={(e) => setStressReason(e.target.value)}
              placeholder="편하게, 적고 싶은 만큼만, 얘기하고 싶은 것만 써주셔도 돼요! 😊"
            ></textarea>
          </div>
        )}
        {/* 나가기 버튼 */}
        <button
          className="absolute right-0 top-0 px-4 py-2 text-sm text-gray-400 hover:text-orange-500 font-semibold"
          onClick={() => setShowExitModal(true)}
          aria-label="설문 나가기"
          type="button"
        >
          X
        </button>
        {/* 설문 간 이동 버튼 */}
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

          {/* 제출 모달 */}
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
      {/* 나가기(닫기) 모달 */}
      {showExitModal && (
        <Modal
          message="정말 설문을 종료할까요?"
          submessage="지금 나가면 작성한 답변이 저장되지 않을 수 있어요. 그래도 나가시겠어요?"
          onClose={() => setShowExitModal(false)}
        >
          <div className="flex w-full gap-3 mt-4">
            <Button variant="secondary" className="w-1/2" onClick={() => setShowExitModal(false)} type="button">
              취소
            </Button>
            <Button
              variant="destructive"
              className="w-1/2"
              onClick={() => {
                setShowExitModal(false);
                router.push('/');
              }}
              type="button"
            >
              나가기
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
