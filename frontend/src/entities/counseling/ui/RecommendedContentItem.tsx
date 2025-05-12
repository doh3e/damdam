/**
 * @file RecommendedContentItem.tsx
 * AI가 추천하는 단일 콘텐츠 항목을 표시하는 UI 컴포넌트입니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import { RecommendedContent } from '@/entities/counseling/model/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'; // Shadcn/ui Card 임포트
import { Button } from '@/shared/ui/button'; // Shadcn/ui Button 임포트
import { cn } from '@/shared/lib/utils';
import { Link2 } from 'lucide-react'; // 아이콘 (예시)

/**
 * RecommendedContentItem 컴포넌트의 Props 인터페이스
 */
interface RecommendedContentItemProps {
  /** 표시할 추천 콘텐츠 객체 */
  content: RecommendedContent;
  /** 추가적인 Tailwind CSS 클래스 */
  className?: string;
}

/**
 * AI 추천 콘텐츠 항목을 표시하는 UI 컴포넌트입니다.
 * Shadcn/ui의 Card 컴포넌트를 활용하여 구조화하고, Button으로 링크를 제공합니다.
 *
 * @param {RecommendedContentItemProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} RecommendedContentItem 컴포넌트
 */
const RecommendedContentItem: React.FC<RecommendedContentItemProps> = ({ content, className }) => {
  const { title, url, description, thumbnailUrl } = content;

  return (
    <Card className={cn('w-full max-w-xs overflow-hidden', className)}>
      {thumbnailUrl && (
        // 이미지가 있다면 CardHeader 대신 직접 img 태그 사용 또는 CardMedia 같은 커스텀 컴포넌트 고려
        <div className="aspect-video overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className={cn({ 'pt-4': thumbnailUrl })}>
        {' '}
        {/* 썸네일 있을 시 간격 조정 */}
        <CardTitle className="text-md leading-tight">{title}</CardTitle>
        {description && <CardDescription className="text-xs mt-1 leading-snug">{description}</CardDescription>}
      </CardHeader>
      <CardFooter className="pt-2 pb-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild // Button 내부에 다른 요소(a 태그)를 렌더링하기 위함
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Link2 className="mr-2 h-3.5 w-3.5" />
            자세히 보기
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecommendedContentItem;
