"use client";
import DataList from "../../conponents/DataList";
import { useEffect, useState } from "react";
import { User } from "../../types/chat";
const UserListingPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user: User) => {
    console.log("User clicked:", user);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
     <DataList users={users} onItemClick={handleUserClick} />
    </div>
  );
};

export default UserListingPage;
