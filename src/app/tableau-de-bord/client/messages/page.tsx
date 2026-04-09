import { ConversationList } from "@/components/messaging/conversation-list";
import { MessageCircle } from "lucide-react";

export default function ClientMessagesPage() {
  return (
    <>
      {/* Sidebar list */}
      <div className="w-full border-r border-gray-200 lg:w-80">
        <div className="border-b border-gray-200 px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
          <ConversationList basePath="/tableau-de-bord/client/messages" />
        </div>
      </div>

      {/* Empty state desktop */}
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            Sélectionnez une conversation pour voir les messages.
          </p>
        </div>
      </div>
    </>
  );
}
