'use client';

import { useEffect, useState } from 'react';

/** "Resume" if the course has progress or this lesson was opened and left part-way (its saved step is past the first), otherwise "Start". */
export function StartOrResume({ contentKey, resume }: { contentKey?: string | null; resume?: boolean }) {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    try {
      const n = Number.parseInt(localStorage.getItem(`xp-lesson-step:${contentKey}`) ?? '', 10);
      setOpened(Number.isFinite(n) && n > 0);
    } catch {}
  }, [contentKey]);
  return <>{resume || opened ? 'Resume' : 'Start'}</>;
}
