import type { Metadata } from 'next';
import { NotFoundContent } from './[locale]/components/not-found-content';

export const metadata: Metadata = {
  title: 'Page not found | ExcelPanda',
};

export default function GlobalNotFound() {
  return <NotFoundContent />;
}
