"use client";

import type { FormEvent } from "react";
import { Lock } from "lucide-react";

interface AdminLoginCardProps {
  password: string;
  authError: string;
  authLoading: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AdminLoginCard({
  password,
  authError,
  authLoading,
  onPasswordChange,
  onSubmit,
}: AdminLoginCardProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Yönetim Paneli Girişi
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Uygulama paylaşmak ve makale yayınlamak için yönetici şifrenizi girin.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Yönetici Şifresi
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {authError && (
            <p className="text-xs font-medium text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {authLoading ? "Giriş Yapılıyor..." : "Panele Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
