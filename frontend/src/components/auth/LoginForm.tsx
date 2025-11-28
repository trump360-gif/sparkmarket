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
import { Mail, Lock, User, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl animate-slide-up">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">로그인</h2>

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
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-600 mb-3 font-medium">빠른 로그인 (테스트용)</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={() => handleQuickLogin('test@sparkmarket.com', 'user123456')}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            일반 유저
          </Button>
          <Button
            type="button"
            onClick={() => handleQuickLogin('admin@sparkmarket.com', 'admin123456')}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            관리자
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
