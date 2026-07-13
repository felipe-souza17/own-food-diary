import type { Metadata } from "next";

import { CalorieGoalForm } from "@/components/settings/calorie-goal-form";
import { ShareLinkManager } from "@/components/share/share-link-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { settingsService } from "@/services/settings.service";
import { shareLinkService } from "@/services/share-link.service";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function SettingsPage() {
  const [session, activeLink, calorieGoal] = await Promise.all([
    auth(),
    shareLinkService.getActive(),
    settingsService.getCalorieGoal(),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie o compartilhamento público e os dados da sua conta."
      />

      <Card>
        <CardHeader>
          <CardTitle>Compartilhamento público</CardTitle>
          <CardDescription>
            Qualquer pessoa com o link pode visualizar seu diário — sem editar, comentar ou excluir.
            Gerar um novo link invalida o anterior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShareLinkManager initialToken={activeLink?.token ?? null} baseUrl={baseUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta calórica</CardTitle>
          <CardDescription>
            Defina o limite diário de calorias usado como referência no gráfico do dashboard e da
            página compartilhada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CalorieGoalForm initialGoal={calorieGoal} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta do administrador</CardTitle>
          <CardDescription>
            As credenciais são definidas pelas variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD.
            Para alterá-las, atualize as variáveis e reinicie a aplicação (ou faça um novo deploy).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="text-sm">
            <dt className="font-medium text-zinc-500">Email</dt>
            <dd className="mt-0.5 text-zinc-900">{session?.user?.email}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
