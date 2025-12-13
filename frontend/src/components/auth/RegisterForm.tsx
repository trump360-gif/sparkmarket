'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      });
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err, '회원가입에 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl animate-slide-up">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">회원가입</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="pl-10"
              placeholder="example@email.com"
              error={errors.email?.message}
            />
          </div>
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-2">
            닉네임
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="nickname"
              type="text"
              {...register('nickname')}
              className="pl-10"
              placeholder="닉네임"
              error={errors.nickname?.message}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="pl-10"
              placeholder="••••••••"
              error={errors.password?.message}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
            비밀번호 확인
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="pl-10"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? '회원가입 중...' : '회원가입'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
