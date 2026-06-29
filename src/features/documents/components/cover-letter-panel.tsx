"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { idleAction } from "@/lib/result";
import { generateCoverLetterAction } from "../actions";

export function CoverLetterPanel({
  applications,
}: {
  applications: { id: string; label: string }[];
}) {
  const [state, action] = useActionState(generateCoverLetterAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          Générer une lettre de motivation
        </CardTitle>
        <CardDescription>
          À partir d’une candidature liée à une offre.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Créez d’abord une candidature liée à une offre.
          </p>
        ) : (
          <form action={action} className="space-y-3">
            <Field
              label="Candidature"
              htmlFor="applicationId"
              error={fe?.applicationId?.[0]}
            >
              <Select id="applicationId" name="applicationId" defaultValue="">
                <option value="">— Choisir —</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </Select>
            </Field>
            <SubmitButton>Générer</SubmitButton>
            {state.status === "error" && !fe && (
              <p className="text-destructive text-sm">{state.message}</p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
