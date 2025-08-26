"use client";
import { useEffect, useState } from "react";
import { columns, User } from "./columns";
import { DataTable } from "@/components/ui/data-tables";
import api from "@/lib/axios";


const PendingRequestsPage = () => {
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendRequestStatus, setFriendRequestStatus] = useState<Record<string, "idle" | "loading" | "sent">>({});

  const fetchPendingRequests = async () => {
  try {
    const res = await api.get('/friends/requests');
    setPendingRequests(res.data.pendingRequests);
    setLoading(false);
  } catch (error) {
    console.error("Failed to fetch pending requests", error);
    setLoading(false);
  }
};
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleUserClick = async(user: User, status: string) => {
    await api.patch(`/friends/requests/${user.id}/respond`, { status:status });
    fetchPendingRequests();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
     <DataTable columns={columns(friendRequestStatus, setFriendRequestStatus,handleUserClick)} data={pendingRequests} />
    </div>
  );
};

export default PendingRequestsPage;

