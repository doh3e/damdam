/**
 * @file RecommendedContentItem.tsx
 * AI가 추천하는 콘텐츠 항목을 표시하는 UI 컴포넌트입니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { RecommendedContent } from '@/entities/counseling/model/types';
import { cn } from '@/shared/lib/utils';

interface RecommendedContentItemProps {
  /** 표시할 추천 콘텐츠 데이터 */
  content: RecommendedContent;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * AI가 추천하는 콘텐츠를 카드 형태로 표시하는 UI 컴포넌트입니다.
 *
 * @param {RecommendedContentItemProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} RecommendedContentItem 컴포넌트
 */
const RecommendedContentItem: React.FC<RecommendedContentItemProps> = ({ content, className }) => {
  // 외부 링크로 이동하는 핸들러
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={cn(
        'flex flex-col border border-border rounded-md overflow-hidden bg-background hover:bg-accent/50 transition-colors cursor-pointer shadow-sm mb-2',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`추천 콘텐츠: ${content.title}`}
    >
      <div className="flex items-start p-3">
        {/* 썸네일 이미지가 있는 경우 */}
        {content.thumbnailUrl && (
          <div className="flex-shrink-0 mr-3">
            <img
              src={content.thumbnailUrl}
              alt={`${content.title} 썸네일`}
              className="w-16 h-16 object-cover rounded-md"
              onError={(e) => {
                // 이미지 로드 실패 시 이미지 표시 안함
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-foreground line-clamp-2 mr-2">{content.title}</h4>
            <ExternalLink size={14} className="flex-shrink-0 text-muted-foreground" />
          </div>

          {/* 설명이 있는 경우 */}
          {content.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{content.description}</p>
          )}

          <div className="text-xs text-primary mt-1 flex items-center">
            <span className="truncate">{new URL(content.url).hostname}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedContentItem;
