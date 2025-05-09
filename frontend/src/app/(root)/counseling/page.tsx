/**
 * 상담 페이지 (지난 상담 목록 또는 새 상담 시작)
 * 경로: /counseling
 *
 * 이 페이지는 사용자가 지난 상담 내역을 확인하거나 새로운 AI 상담을 시작할 수 있는
 * 랜딩 페이지 역할을 합니다.
 * FSD 아키텍처에서 `app` 레이어의 페이지 컴포넌트에 해당합니다.
 * Next.js App Router의 파일 시스템 기반 라우팅에 의해 이 파일이 `/counseling` 경로와 매핑됩니다.
 *
 * @returns {JSX.Element} 상담 페이지 컴포넌트
 */
const CounselingPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-charcoal-black">상담 시작하기</h1>
      <p className="text-muted-foreground">이곳에서 지난 상담 내역을 확인하거나 새로운 상담을 시작할 수 있습니다.</p>
      {/* 향후 이 부분에 PastCounselingList 위젯과 새 상담 시작 버튼이 위치하게 됩니다. */}
    </div>
  );
};

export default CounselingPage;
