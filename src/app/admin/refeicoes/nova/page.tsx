import type { Metadata } from "next";

import { MealForm } from "@/components/meals/meal-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Nova refeição",
};

export default function NewMealPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova refeição"
        description="Registre o que você comeu, com fotos e observações."
      />
      <MealForm />
    </div>
  );
}
