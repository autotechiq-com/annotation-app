'use client';

import { cn } from '@/lib/utils';
import { marked } from 'marked';
import { useEffect, useState } from 'react';

function MarkdownRenderer({ markdown, className }: { markdown?: string | null; className?: string }) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (!markdown) return;
    (async () => {
      const html = await marked(markdown);
      setHtmlContent(html);
    })();
  }, [markdown]);

  return <div className={cn('markdown-content', className)} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export { MarkdownRenderer };
