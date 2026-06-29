"use client";

import { useActionState } from "react";

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
import { generatePrepAction } from "../actions";

export function GeneratePrep({
  applications,
}: {
  applications: { id: string; label: string }[];
}) {
  const [state, action] = useActionState(generatePrepAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Générer une préparation</CardTitle>
        <CardDescription>
          Choisissez une candidature liée à une offre. L’IA prépare questions,
          quiz, cas pratiques et plan de révision.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Créez d’abord une candidature liée à une offre.
          </p>
        ) : (
          <form action={action} className="space-y-4">
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
            <SubmitButton>Générer la préparation</SubmitButton>
            {state.status === "error" && !fe && (
              <p className="text-destructive text-sm">{state.message}</p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
