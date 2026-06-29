import { z } from "zod";

const quizItem = z.object({
  question: z.string().catch(""),
  answer: z.string().catch(""),
});

/** Structured interview-prep output. Tolerant: missing sections become empty. */
export const interviewPrepSchema = z.object({
  hrQuestions: z.array(z.string()).catch([]),
  technicalQuestions: z.array(z.string()).catch([]),
  quiz: z.array(quizItem).catch([]),
  caseStudies: z.array(z.string()).catch([]),
  checklist: z.array(z.string()).catch([]),
  revisionPlan: z.array(z.string()).catch([]),
});

export type InterviewPrepData = z.infer<typeof interviewPrepSchema>;
export type QuizItem = z.infer<typeof quizItem>;
