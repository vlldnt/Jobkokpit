"use client";

import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { idleAction, type ActionState } from "@/lib/result";

type BoundAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

const EVENT_OPTIONS = [
  { value: "NOTE", label: "Note" },
  { value: "EMAIL_SENT", label: "E-mail envoyé" },
  { value: "EMAIL_RECEIVED", label: "E-mail reçu" },
  { value: "INTERVIEW_SCHEDULED", label: "Entretien planifié" },
  { value: "OTHER", label: "Autre" },
];

function Feedback({ state }: { state: ActionState }) {
  if (state.status === "success" && state.message) {
    return (
      <p className="text-sm text-emerald-600 dark:text-emerald-400">
        {state.message}
      </p>
    );
  }
  if (state.status === "error" && !state.fieldErrors) {
    return <p className="text-destructive text-sm">{state.message}</p>;
  }
  return null;
}

export function ApplicationActions({
  addEvent,
  scheduleFollowUp,
}: {
  addEvent: BoundAction;
  scheduleFollowUp: BoundAction;
}) {
  const [eventState, eventAction] = useActionState(addEvent, idleAction);
  const [followState, followAction] = useActionState(
    scheduleFollowUp,
    idleAction,
  );
  const eventFe =
    eventState.status === "error" ? eventState.fieldErrors : undefined;
  const followFe =
    followState.status === "error" ? followState.fieldErrors : undefined;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter un événement</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={eventAction} className="space-y-3">
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue="NOTE">
                {EVENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Titre" htmlFor="title" error={eventFe?.title?.[0]}>
              <Input id="title" name="title" required />
            </Field>
            <Field label="Détail" htmlFor="detail">
              <Textarea id="detail" name="detail" className="min-h-20" />
            </Field>
            <SubmitButton>Ajouter</SubmitButton>
            <Feedback state={eventState} />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planifier une relance</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={followAction} className="space-y-3">
            <Field label="Date" htmlFor="date" error={followFe?.date?.[0]}>
              <Input id="date" name="date" type="date" required />
            </Field>
            <Field label="Note" htmlFor="note">
              <Textarea id="note" name="note" className="min-h-20" />
            </Field>
            <SubmitButton>Planifier</SubmitButton>
            <Feedback state={followState} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
