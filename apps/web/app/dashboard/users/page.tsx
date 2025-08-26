"use client";
import { useEffect, useState } from "react";
import { columns, User } from "./columns";
import { DataTable } from "@/components/ui/data-tables";
import api from "@/lib/axios";

interface Props {
  currentUser: User | null;
}

const UserListingPage: React.FC<Props> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
   const [friendRequestStatus, setFriendRequestStatus] = useState<Record<string, "idle" | "loading" | "sent">>({});

   const fetchAllUsers = async () => {
     setLoading(true);
     try {
       const res = await api.get('/users');
       setUsers(res.data.availableUsers);
     } catch (error) {
       console.error("Failed to fetch users", error);
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    fetchAllUsers();
  }, []);

   const handleUserClick = async (user: User) => {
    setFriendRequestStatus(prev => ({ ...prev, [user.id]: "loading" }));
    try {
      await api.post('/friends/request', { receiverId: user.id });
      setFriendRequestStatus(prev => ({ ...prev, [user.id]: "sent" }));
    } catch (error) {
      setFriendRequestStatus(prev => ({ ...prev, [user.id]: "idle" }));
      console.error("Failed to send friend request", error);
    }
    fetchAllUsers();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
     <DataTable columns={columns(friendRequestStatus, setFriendRequestStatus, handleUserClick)} data={users} />
    </div>
  );
};

export default UserListingPage;
