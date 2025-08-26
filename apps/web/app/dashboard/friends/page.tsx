"use client";
import { useEffect, useState } from "react";
import { columns, User } from "./columns";
import { DataTable } from "@/components/ui/data-tables";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useChatContext } from "@/context/ChatContext";

const FriendsPage = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setSelectedChat } = useChatContext();

  useEffect(() => {
    const fetchFriends = api.get('/friends');
    fetchFriends.then((res) => {
      setFriends(res.data.friends);
      setLoading(false);
    });
  }, []);

  const handleUserClick = async(user: User& { receiverId?: string }) => {
    const response = await api.post("/messages/conversation/new", { receiverId: user.receiverId });
    if (response.status === 200 && response.data?.id) {
      setSelectedChat(response.data.id);
      setTimeout(() => {
        router.push(`/dashboard/chats`);
      }, 100);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Friends</h2>
     <DataTable columns={columns(handleUserClick)} data={friends} />
    </div>
  );
};

export default FriendsPage;

