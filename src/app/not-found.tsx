import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
      <p className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">
        {dict.notFound.code}
      </p>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        {dict.notFound.title}
      </h1>
      <p className="text-slate-600 dark:text-zinc-400 text-sm">
        {dict.notFound.desc}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{dict.notFound.backHome}</span>
      </Link>
    </div>
  );
}
