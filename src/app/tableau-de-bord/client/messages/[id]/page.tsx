import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatThread } from "@/components/messaging/chat-thread";

export default async function ClientConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: { some: { userId: session.user.id } },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              sellerProfile: { select: { displayName: true } },
              buyerProfile: { select: { displayName: true } },
              roleAssignments: { select: { role: true } },
            },
          },
        },
      },
      service: { select: { id: true, title: true } },
    },
  });

  if (!conversation) notFound();

  const other = conversation.participants.find(
    (p) => p.userId !== session.user.id,
  );
  const otherName =
    other?.user.sellerProfile?.displayName ??
    other?.user.buyerProfile?.displayName ??
    "Utilisateur";

  const myRoles = (session.user.roles ?? []) as string[];
  const iAmSeller = myRoles.includes("SELLER");

  return (
    <>
      <div className="hidden w-80 border-r border-gray-200 lg:block">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
          <ConversationList
            basePath="/tableau-de-bord/client/messages"
            activeId={id}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <ChatThread
          conversationId={id}
          otherUserName={otherName}
          serviceName={conversation.service?.title}
          iAmSeller={iAmSeller}
          hasService={!!conversation.service}
        />
      </div>
    </>
  );
}
