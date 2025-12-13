'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { usersApi } from '@/lib/api/users';
import { ReviewCard } from '@/components/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Star, MessageSquare, User } from 'lucide-react';
import type { UserProfile, Review } from '@/types';

export default function UserReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, reviewsData] = await Promise.all([
          usersApi.getUserProfile(userId),
          usersApi.getUserReviews(userId, { limit: 50 }),
        ]);
        setProfile(profileData);
        setReviews(reviewsData.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <Skeleton className="h-32 w-full rounded-xl mb-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-16">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">사용자를 찾을 수 없습니다</h2>
          <p className="text-slate-500 mb-8">요청하신 사용자가 존재하지 않습니다.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            돌아가기
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-60 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-1/4 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center text-slate-600 hover:text-primary-600 transition-colors group animate-fade-in"
        >
          <span className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mr-2 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </span>
          <span className="font-medium">돌아가기</span>
        </button>

        {/* 사용자 프로필 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-5 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary-500/20 overflow-hidden relative">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.nickname}
                  fill
                  className="object-cover"
                />
              ) : (
                profile.nickname?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{profile.nickname}</h1>
              {profile.stats && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-amber-500 text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{profile.stats.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({profile.stats.reviewCount}개 리뷰)</span>
                  </span>
                </div>
              )}
              {profile.stats && (
                <p className="text-slate-500 text-xs mt-1">
                  판매 {profile.stats.salesCount}건 · 구매 {profile.stats.purchaseCount}건
                </p>
              )}
            </div>
          </div>
          {profile.bio && (
            <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {profile.bio}
            </p>
          )}
        </div>

        {/* 리뷰 목록 */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">받은 리뷰</h2>
            <span className="text-sm text-slate-500">({reviews.length})</span>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-10 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                받은 리뷰가 없습니다
              </h3>
              <p className="text-slate-500 text-sm">
                아직 이 사용자에게 작성된 리뷰가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
