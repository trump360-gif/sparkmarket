import LoginForm from '@/components/auth/LoginForm';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-lg opacity-50 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white p-3 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 fill-current" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Spark<span className="text-primary-600">Market</span>
          </h1>
          <p className="text-slate-600">다시 만나서 반가워요!</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
