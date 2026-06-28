import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="text-muted-foreground flex min-h-40 items-center justify-center py-10 text-sm">
          Module en cours de construction.
        </CardContent>
      </Card>
    </>
  );
}
