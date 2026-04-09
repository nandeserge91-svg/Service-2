import { auth } from "@/lib/auth";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, ShoppingBag, Star, Clock, Plus, ArrowRight,
} from "lucide-react";

export default async function SellerDashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue, {session?.user?.name?.split(" ")[0] ?? "vendeur"} !
        </h1>
        <Link href="/tableau-de-bord/vendeur/services/nouveau">
          <Button icon={<Plus className="h-4 w-4" />}>
            Nouveau service
          </Button>
        </Link>
      </div>

      {/* Checklist onboarding */}
      <Card className="border-primary-200 bg-primary-50">
        <p className="mb-3 text-sm font-semibold text-primary-800">
          Complétez votre profil pour attirer plus de clients
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">✓ Compte créé</Badge>
          <Badge variant="default">○ Compléter le profil</Badge>
          <Badge variant="default">○ Publier un service</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0 FCFA</p>
              <p className="text-sm text-gray-500">Revenus ce mois</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Commandes actives</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-500">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-500">Note moyenne</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-500">Taux à temps</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Mes services</CardTitle>
          <Link
            href="/tableau-de-bord/vendeur/services"
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="mb-3 text-sm text-gray-500">
            Publiez votre premier service pour commencer à recevoir des commandes.
          </p>
          <Link href="/tableau-de-bord/vendeur/services/nouveau">
            <Button variant="outline" icon={<Plus className="h-4 w-4" />}>
              Créer un service
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
