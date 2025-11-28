'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api/users';
import { uploadApi } from '@/lib/api/upload';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Camera, User, Save, ArrowLeft, Star } from 'lucide-react';
import type { UserProfile } from '@/types';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await usersApi.getMyProfile();
        setProfile(data);
        setNickname(data.nickname);
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      } catch (error: any) {
        // 401 에러는 조용히 무시
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch profile:', error);
          toast.error('프로필을 불러오는데 실패했습니다');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setIsUploading(true);
    try {
      const { presignedUrl, publicUrl } = await uploadApi.getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setAvatarUrl(publicUrl);
      toast.success('이미지가 업로드되었습니다');
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to upload image:', error);
        toast.error('이미지 업로드에 실패했습니다');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      toast.error('닉네임은 2~20자여야 합니다');
      return;
    }

    setIsSaving(true);
    try {
      await usersApi.updateMyProfile({
        nickname: nickname.trim(),
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl || undefined,
      });

      toast.success('프로필이 저장되었습니다');

      // 사용자 정보 새로고침
      if (refreshUser) {
        await refreshUser();
      }

      router.push('/mypage');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      if (error.response?.data?.message === '이미 사용 중인 닉네임입니다') {
        toast.error('이미 사용 중인 닉네임입니다');
      } else {
        toast.error('프로필 저장에 실패했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-2xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="bg-white rounded-xl p-6 space-y-6">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">프로필 설정</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="프로필"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {nickname?.[0]?.toUpperCase() || user?.nickname?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {isUploading && (
              <p className="text-sm text-slate-500 mt-2">업로드 중...</p>
            )}
          </div>

          {/* 통계 */}
          {profile?.stats && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{profile.stats.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-500">평점 ({profile.stats.reviewCount})</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">{profile.stats.salesCount}</p>
                <p className="text-xs text-slate-500">판매</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">{profile.stats.purchaseCount}</p>
                <p className="text-xs text-slate-500">구매</p>
              </div>
            </div>
          )}

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              닉네임
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">2~20자, 한글/영문/숫자/밑줄 사용 가능</p>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개를 입력하세요 (선택)"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{bio.length}/200</p>
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">이메일은 변경할 수 없습니다</p>
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>
    </main>
  );
}
