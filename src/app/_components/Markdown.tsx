// ./components/Markdown.tsx
import React from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "~/core/utils";

export function Markdown({
  className,
  children,
  style,
  ...props
}: Options & { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn(className, "markdown")} style={style}>
      <ReactMarkdown
        // GFM 플러그드 활성화
        remarkPlugins={[remarkGfm]}
        // 기존 a 태그 외에도 테이블 스타일을 정의
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ node, ...tableProps }) => (
            <table className="min-w-full divide-y divide-gray-200 border" {...tableProps} />
          ),
          th: ({ node, ...thProps }) => (
            <th className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500" {...thProps} />
          ),
          td: ({ node, ...tdProps }) => (
            <td className="px-4 py-2 text-sm text-gray-700" {...tdProps} />
          ),
        }}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
