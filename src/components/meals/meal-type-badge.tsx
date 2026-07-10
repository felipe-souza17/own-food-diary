import { Badge } from "@/components/ui/badge";
import { MEAL_TYPE_BADGE_CLASSES, MEAL_TYPE_LABELS, type MealTypeValue } from "@/lib/constants";

export function MealTypeBadge({ mealType }: { mealType: MealTypeValue }) {
  return <Badge className={MEAL_TYPE_BADGE_CLASSES[mealType]}>{MEAL_TYPE_LABELS[mealType]}</Badge>;
}
