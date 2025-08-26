"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Loader2Icon } from "lucide-react"
import { IconUserPlus } from '@tabler/icons-react';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string
  name: string
  email: string,
  profile?: string
}

export const columns = (
  friendRequestStatus: Record<string, "idle" | "loading" | "sent">,
  setFriendRequestStatus: React.Dispatch<React.SetStateAction<Record<string, "idle" | "loading" | "sent">>>,
  onClick: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "profile",
    header: "Profile",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const userId = row.original.id;
      const status = friendRequestStatus[userId] || "idle";

      return (
        <Button
      size="sm"
      variant={status === "sent" ? "default" : "outline"}
      disabled={status === "sent"}
      onClick={() => onClick(row.original)}
      className="flex items-center gap-2 cursor-pointer"
    >
      {status === "loading" ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <IconUserPlus />
          )}
      {status === "sent" ? "Sent" : "Send Request"}
    </Button>
      );
    },
  },
];