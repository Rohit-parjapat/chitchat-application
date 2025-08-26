"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Loader2Icon } from "lucide-react"
import { IconSend } from "@tabler/icons-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string
  name: string
  email: string,
  profile?: string,
  status?: string
}

export const columns = (onClick: (user: User) => void): ColumnDef<User>[] => [
  {
    id: "name",
    accessorKey: "to.name",
     header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "email",
    accessorKey: "to.email",
    header: "Email",
  },
  {
    id: "profile",
    accessorKey: "to.profile",
    header: "Profile",
  },
 {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className={`px-2 py-1 rounded text-sm font-medium ${status === "PENDING" ? "bg-yellow-100 text-yellow-800 border border-yellow-500" : status === "ACCEPTED" ? "bg-green-100 text-green-800 border border-green-500" : "bg-red-100 text-red-800 border border-red-500"}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const userId = row.original.id;
      // const status = friendRequestStatus[userId] || "idle";
      const status = row.original.status || "idle";

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
            <IconSend />
          )}
      {status === "sent" ? "Sent" : "Send Message"}
    </Button>
      );
    },
  },
]