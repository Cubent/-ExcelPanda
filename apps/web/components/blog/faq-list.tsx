import type { BlogFaq } from '@/content/blog/types';
import Link from 'next/link';
import type { ReactNode } from 'react';

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Turns `[text](/path)` in an answer into links. Schema output uses `faqToPlainText` instead. */
const renderAnswer = (answer: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of answer.matchAll(LINK)) {
    const [full, text, href] = match;
    const start = match.index ?? 0;
    if (start > last) nodes.push(answer.slice(last, start));
    nodes.push(
      href.startsWith('/') ? (
        <Link key={start} href={href}>
          {text}
        </Link>
      ) : (
        <a key={start} href={href} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    );
    last = start + full.length;
  }
  if (last < answer.length) nodes.push(answer.slice(last));
  return nodes;
};

export const faqToPlainText = (answer: string) => answer.replace(LINK, '$1');

export const FaqList = ({ faqs }: { faqs: BlogFaq[] }) => (
  <>
    {faqs.map((faq) => (
      <div key={faq.question}>
        <h3>{faq.question}</h3>
        <p>{renderAnswer(faq.answer)}</p>
      </div>
    ))}
  </>
);
