import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addMessageAction } from "@/features/emails/actions";
import { MessageForm } from "@/features/emails/components/message-form";
import { getThreadDecrypted } from "@/features/emails/service";

export const metadata: Metadata = { title: "Conversation" };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await getThreadDecrypted(id);
  if (!thread) notFound();

  return (
    <>
      <PageHeader
        title={thread.subject}
        description={thread.application?.offer?.title ?? undefined}
        action={
          <Button asChild variant="ghost">
            <Link href="/emails">
              <ArrowLeft />
              Retour
            </Link>
          </Button>
        }
      />

      <div className="mb-6 space-y-3">
        {thread.messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun message.</p>
        ) : (
          thread.messages.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">
                    {m.subject || thread.subject}
                  </CardTitle>
                  <Badge
                    variant={m.direction === "OUTBOUND" ? "info" : "default"}
                  >
                    {m.direction === "OUTBOUND" ? "Envoyé" : "Reçu"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {m.fromAddr} → {m.toAddr}
                  {m.sentAt ? ` · ${m.sentAt.toLocaleDateString("fr-FR")}` : ""}
                </p>
              </CardHeader>
              {m.body && (
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <MessageForm action={addMessageAction.bind(null, id)} />
    </>
  );
}
