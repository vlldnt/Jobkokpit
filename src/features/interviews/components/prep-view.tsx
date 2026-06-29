import type { InterviewPrep } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const asQuiz = (v: unknown): { question: string; answer: string }[] =>
  Array.isArray(v)
    ? v.map((x) => {
        const item = (x ?? {}) as Record<string, unknown>;
        return {
          question: String(item.question ?? ""),
          answer: String(item.answer ?? ""),
        };
      })
    : [];

function ListCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function PrepView({ prep }: { prep: InterviewPrep }) {
  const quiz = asQuiz(prep.quiz);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ListCard title="Questions RH" items={asStrings(prep.hrQuestions)} />
      <ListCard
        title="Questions techniques"
        items={asStrings(prep.technicalQuestions)}
      />
      <ListCard title="Cas pratiques" items={asStrings(prep.caseStudies)} />
      <ListCard title="Checklist" items={asStrings(prep.checklist)} />
      <ListCard title="Plan de révision" items={asStrings(prep.revisionPlan)} />

      {quiz.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quiz.map((q, i) => (
              <details key={i} className="rounded-lg border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {q.question}
                </summary>
                <p className="text-muted-foreground mt-2 text-sm">{q.answer}</p>
              </details>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
