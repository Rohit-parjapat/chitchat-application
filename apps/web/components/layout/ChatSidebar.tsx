import { Chat, User } from "../../types/chat";
// import Link from "next/link";

type Props = {
  chats: Chat[];
  onSelect: (id: string) => void;
  selectedId: string;
  currentUser: User | null
};

const ChatSidebar: React.FC<Props> = ({ chats, onSelect, selectedId, currentUser }) => {
  const processedChats = chats.map((chat: Chat) => {
    let displayName = chat.name;

    if (!displayName) {
      const member = chat.participants.find((p) => p.userId !== currentUser?.id);
      displayName = member?.user.name || "Unknown";
    }

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
    <aside className="w-1/3 h-full bg-gray-100 border-r flex flex-col">
      <div className="p-4 text-xl font-bold">Chats</div>
      <div className="flex-1 overflow-y-auto">
        {processedChats.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-center p-4 cursor-pointer ${selectedId === c.id ? "bg-gray-200" : ""}`}
          >
            <div>
              <div className="font-medium truncate max-w-xs">{c.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-xs">{c.lastMessage}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebar;
