"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createMealAction, updateMealAction } from "@/actions/meal.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/meals/image-uploader";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/constants";
import { todayInputValue } from "@/lib/utils";
import { mealFormSchema, type MealFormValues } from "@/validators/meal.schema";

interface MealFormProps {
  meal?: MealFormValues & { id: string };
}

const MEAL_TYPE_OPTIONS = MEAL_TYPES.map((type) => ({
  value: type,
  label: MEAL_TYPE_LABELS[type],
}));

export function MealForm({ meal }: MealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!meal;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: meal ?? {
      date: todayInputValue(),
      mealType: "BREAKFAST",
      description: "",
      notes: "",
      images: [],
    },
  });

  function onSubmit(values: MealFormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateMealAction(meal.id, values)
        : await createMealAction(values);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Refeição atualizada!" : "Refeição registrada!");
      router.push("/admin/refeicoes");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="space-y-5 py-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Data" htmlFor="date" required error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    id="date"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    invalid={!!errors.date}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Tipo da refeição"
              htmlFor="mealType"
              required
              error={errors.mealType?.message}
            >
              <Controller
                control={control}
                name="mealType"
                render={({ field }) => (
                  <Select
                    id="mealType"
                    value={field.value}
                    onChange={field.onChange}
                    options={MEAL_TYPE_OPTIONS}
                    disabled={isPending}
                    invalid={!!errors.mealType}
                    ariaLabel="Tipo da refeição"
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            label="Descrição"
            htmlFor="description"
            required
            error={errors.description?.message}
            hint="O que você comeu? Ex.: Omelete de dois ovos com espinafre e café sem açúcar."
          >
            <Textarea
              id="description"
              rows={3}
              placeholder="Descreva a refeição…"
              aria-invalid={!!errors.description}
              disabled={isPending}
              {...register("description")}
            />
          </FormField>

          <FormField
            label="Observações"
            htmlFor="notes"
            error={errors.notes?.message}
            hint="Opcional. Ex.: senti muita fome à tarde, comi fora de casa…"
          >
            <Textarea
              id="notes"
              rows={2}
              placeholder="Alguma observação?"
              aria-invalid={!!errors.notes}
              disabled={isPending}
              {...register("notes")}
            />
          </FormField>

          <FormField label="Fotos" htmlFor="images" error={errors.images?.message}>
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} disabled={isPending} />
              )}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push("/admin/refeicoes")}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? "Salvar alterações" : "Registrar refeição"}
        </Button>
      </div>
    </form>
  );
}
