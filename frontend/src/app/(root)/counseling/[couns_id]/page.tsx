/**
 * 개별 상담 채팅 페이지
 * 경로: /counseling/[couns_id] (예: /counseling/123)
 *
 * 이 페이지는 특정 상담 ID에 해당하는 AI와의 1:1 채팅 화면을 표시합니다.
 * `[couns_id]`는 동적 세그먼트로, 실제 상담 ID 값으로 대체됩니다.
 * FSD 아키텍처에서 `app` 레이어의 페이지 컴포넌트에 해당합니다.
 * Next.js App Router는 파일 시스템의 대괄호([])를 사용하여 동적 라우트를 생성합니다.
 *
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {object} props.params - Next.js가 주입하는 동적 라우트 파라미터 객체
 * @param {string} props.params.couns_id - URL 경로에서 추출된 상담 ID
 * @returns {JSX.Element} 개별 상담 채팅 페이지 컴포넌트
 */
const CounselingChatPage = ({ params }: { params: { couns_id: string } }) => {
  const { couns_id } = params;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-charcoal-black">
        상담 채팅방 <span className="text-tomato-red">ID: {couns_id}</span>
      </h1>
      <p className="text-muted-foreground">
        이곳에서 ID가 <span className="font-semibold text-pale-coral-pink">{couns_id}</span>인 상담의 채팅 UI가
        표시됩니다.
      </p>
      {/* 
        향후 이 부분에 CounselingChatWindow 위젯이 위치하게 됩니다. 
        이 위젯은 couns_id를 기반으로 해당 상담의 메시지를 불러오고, 
        실시간 웹소켓 통신을 처리하여 채팅 UI를 구성합니다.
      */}
    </div>
  );
};

export default CounselingChatPage;
