import "server-only";

import type { Prisma } from "@prisma/client";

import type { InterviewPrepData } from "@/agents/interview-prep/schema";
import { db } from "@/lib/db";

const toJson = (v: unknown) =>
  JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;

export function listPreps(userId: string) {
  return db.interviewPrep.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      model: true,
      application: {
        select: {
          id: true,
          offer: { select: { title: true } },
          company: { select: { name: true } },
        },
      },
    },
  });
}

export function getPrep(userId: string, id: string) {
  return db.interviewPrep.findFirst({
    where: { id, userId },
    include: {
      application: {
        select: {
          id: true,
          offer: { select: { title: true } },
          company: { select: { name: true } },
        },
      },
    },
  });
}

/** Application context used to feed Agent 4. */
export function getApplicationContext(userId: string, applicationId: string) {
  return db.application.findFirst({
    where: { id: applicationId, userId, deletedAt: null },
    select: {
      id: true,
      company: { select: { name: true } },
      offer: {
        select: {
          title: true,
          description: true,
          seniority: true,
          analysis: { select: { technologies: true } },
        },
      },
    },
  });
}

export function listApplicationOptions(userId: string) {
  return db.application.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      offer: { select: { title: true } },
      company: { select: { name: true } },
    },
  });
}

export function createPrep(
  userId: string,
  applicationId: string,
  data: InterviewPrepData,
  model: string,
) {
  return db.interviewPrep.create({
    data: {
      userId,
      applicationId,
      hrQuestions: toJson(data.hrQuestions),
      technicalQuestions: toJson(data.technicalQuestions),
      quiz: toJson(data.quiz),
      caseStudies: toJson(data.caseStudies),
      checklist: toJson(data.checklist),
      revisionPlan: toJson(data.revisionPlan),
      model,
    },
    select: { id: true },
  });
}
