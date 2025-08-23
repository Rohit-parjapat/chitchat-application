import { Chat, User } from "../types/chat";

type Props = {
  chats: Chat[];
  onSelect: (id: string) => void;
  selectedId: string;
  currentUser: User | null
};

const ChatSidebar: React.FC<Props> = ({ chats, onSelect, selectedId, currentUser }) => {
  // Transform raw chats for UI rendering
  const processedChats = chats.map((chat: Chat) => {
    // Use chat.name if available, else get member participant's name
    let displayName = chat.name;

    if (!displayName) {
      const member = chat.participants.find((p) => p.userId !== currentUser?.id);
      // fallback if no member found or name is null
      displayName = member?.user.name || "Unknown";
    }

    // Get last message text or fallback
    const lastMessage =
      chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1]?.content
        : "No messages yet";

    return {
      id: chat.id,
      name: displayName,
      lastMessage,
    };
  });

  return (
    <aside className="w-1/3 bg-gray-100 border-r overflow-y-auto">
      <div className="p-4 text-xl font-bold">Chats</div>
      {processedChats.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`flex items-center p-4 cursor-pointer ${
            selectedId === c.id ? "bg-gray-200" : ""
          }`}
        >
          <div>
            <div className="font-medium truncate max-w-xs">{c.name}</div>
            <div className="text-xs text-gray-500 truncate max-w-xs">{c.lastMessage}</div>
          </div>
        </div>
      ))}
    </aside>
  );
};

export default ChatSidebar;
