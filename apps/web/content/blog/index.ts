import { post as abimStudyGuide } from './abim-study-guide';
import { post as abimSyllabus } from './abim-syllabus';
import { post as bestUsmleQuestionBanks } from './best-usmle-question-banks';
import { post as eightThingsStep1 } from './8-things-to-know-usmle-step-1';
import { post as step1PassFail } from './usmle-step-1-pass-fail-score';
import { post as step2CkPercentile } from './usmle-step-2-ck-score-percentile';
import { post as step2CkScoreBySpecialty } from './step-2-ck-score-by-specialty';
import { post as step1ExamDates2026 } from './usmle-step-1-exam-dates-2026';
import { post as step1StudyGuide } from './usmle-step-1-study-guide';
import { post as step2CkExamDates2026 } from './usmle-step-2-ck-exam-dates-2026';
import { post as step2CkStudyGuide } from './usmle-step-2-ck-study-guide';
import { post as step3ExamDates2026 } from './usmle-step-3-exam-dates-2026';
import { post as step3StudyGuide } from './usmle-step-3-study-guide';
import { post as topAbimQuestionBanks } from './top-abim-question-banks';
import { post as topStep1QuestionBanks } from './top-usmle-step-1-question-banks';
import { post as topStep2CkQuestionBanks } from './top-usmle-step-2-ck-question-banks';
import { post as topStep3QuestionBanks } from './top-usmle-step-3-question-banks';
import { post as twoPassesQbank } from './two-passes-through-a-usmle-question-bank';
import { post as usmleStep1Syllabus } from './usmle-step-1-syllabus';
import { post as usmleStep2CkSyllabus } from './usmle-step-2-ck-syllabus';
import { post as usmleStep3Syllabus } from './usmle-step-3-syllabus';
import type { BlogPost } from './types';

export const posts: BlogPost[] = [
  step2CkPercentile,
  step2CkScoreBySpecialty,
  step1PassFail,
  bestUsmleQuestionBanks,
  twoPassesQbank,
  step1StudyGuide,
  step2CkStudyGuide,
  step3StudyGuide,
  abimStudyGuide,
  step1ExamDates2026,
  step2CkExamDates2026,
  step3ExamDates2026,
  eightThingsStep1,
  topStep1QuestionBanks,
  topStep2CkQuestionBanks,
  topStep3QuestionBanks,
  usmleStep1Syllabus,
  usmleStep2CkSyllabus,
  usmleStep3Syllabus,
  abimSyllabus,
  topAbimQuestionBanks,
];
