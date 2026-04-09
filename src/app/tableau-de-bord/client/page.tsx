import { auth } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag, MessageCircle, Clock } from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Bonjour, {session?.user?.name?.split(" ")[0] ?? "vous"} !
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Messages non lus</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Actions requises</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Commandes récentes</CardTitle>
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Pas encore de commande"
          description="Trouvez un service qui correspond à votre besoin et passez votre première commande."
          actionLabel="Parcourir les services"
          actionHref="/services"
        />
      </Card>
    </div>
  );
}
