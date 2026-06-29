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

export function MessageForm({ action }: { action: BoundAction }) {
  const [state, formAction] = useActionState(action, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ajouter un message</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Sens" htmlFor="direction">
              <Select id="direction" name="direction" defaultValue="OUTBOUND">
                <option value="OUTBOUND">Envoyé</option>
                <option value="INBOUND">Reçu</option>
              </Select>
            </Field>
            <Field label="De *" htmlFor="fromAddr" error={fe?.fromAddr?.[0]}>
              <Input id="fromAddr" name="fromAddr" required />
            </Field>
            <Field label="À *" htmlFor="toAddr" error={fe?.toAddr?.[0]}>
              <Input id="toAddr" name="toAddr" required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sujet" htmlFor="subject">
              <Input id="subject" name="subject" />
            </Field>
            <Field label="Date" htmlFor="sentAt">
              <Input id="sentAt" name="sentAt" type="date" />
            </Field>
          </div>
          <Field label="Message" htmlFor="body">
            <Textarea id="body" name="body" className="min-h-32" />
          </Field>

          <SubmitButton>Ajouter</SubmitButton>
          {state.status === "success" && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {state.message}
            </p>
          )}
          {state.status === "error" && !fe && (
            <p className="text-destructive text-sm">{state.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
