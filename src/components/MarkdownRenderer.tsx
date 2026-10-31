"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kopyalandı</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Kopyala</span>
        </>
      )}
    </button>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-slate-700 dark:text-zinc-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 pb-2 border-b border-slate-200 dark:border-zinc-800 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-zinc-100 mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-base leading-7 text-slate-700 dark:text-zinc-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 px-4 py-3 rounded-r-lg italic text-slate-700 dark:text-zinc-300 my-4">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const safeHref =
              href && /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : "#";
            return (
              <a
                href={safeHref}
                target={safeHref.startsWith("http") ? "_blank" : undefined}
                rel={
                  safeHref.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:text-indigo-500 font-medium"
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => {
            const srcStr = typeof src === "string" ? src : "";
            const safeSrc =
              srcStr && /^(https?:\/\/|\/uploads\/)/i.test(srcStr)
                ? srcStr
                : "";
            if (!safeSrc) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={safeSrc}
                alt={alt || ""}
                loading="lazy"
                className="rounded-xl border border-slate-200 dark:border-zinc-800 my-6 max-h-[480px] object-cover w-full"
              />
            );
          },
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeText = String(children).replace(/\n$/, "");
            const isBlock = Boolean(match) || codeText.includes("\n");

            if (!isBlock) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 font-mono text-[0.875em]">
                  {children}
                </code>
              );
            }

            return (
              <div className="my-5 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                  <span>{match ? match[1] : "code"}</span>
                  <CopyCodeButton code={codeText} />
                </div>
                <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{codeText}</code>
                </pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-sm text-left">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-slate-200/60 dark:border-zinc-800/60">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
