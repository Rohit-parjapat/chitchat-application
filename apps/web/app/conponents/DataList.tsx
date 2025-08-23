import React from "react";
import { User } from "../types/chat";


type DataListProps = {
  users: User[];
  emptyMessage?: string;
  onItemClick?: (user: User) => void;
};

const DataList: React.FC<DataListProps> = ({ users, emptyMessage = "No data available", onItemClick }) => {
  if (users.length === 0) {
    return <p className="text-gray-500 text-center py-4">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 overflow-y-auto max-h-[400px]">
      {users.map((user, index) => (
        <li
          key={user.id}
          onClick={() => onItemClick && onItemClick(user)}
          className="hover:bg-gray-100 p-4"
        >
          <h3 className="font-semibold text-gray-800"><span>{index + 1}. </span>{user.name}</h3>
        </li>
      ))}
    </ul>
  );
};

export default DataList;
