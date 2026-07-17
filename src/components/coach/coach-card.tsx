import { Suspense } from "react";
import { Compass } from "lucide-react";

import { CoachTip, CoachTipSkeleton } from "@/components/coach/coach-tip";
import { DayPlan } from "@/components/coach/day-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coachService } from "@/services/coach.service";

/** Coach do dia: plano determinístico (instantâneo) + dica da IA (streamed). */
export async function CoachCard() {
  const snapshot = await coachService.getSnapshot();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass aria-hidden className="size-4 text-emerald-600" />
          Coach do dia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <DayPlan goal={snapshot.goal} consumed={snapshot.consumed} byType={snapshot.byType} />

        <Suspense fallback={<CoachTipSkeleton />}>
          <CoachTip />
        </Suspense>
      </CardContent>
    </Card>
  );
}
