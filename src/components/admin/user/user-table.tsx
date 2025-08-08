"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVerticalIcon, UserCircleIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getImageSrc } from "@/lib/utils";
import { DataTable } from "../../common/DataTable";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

interface UserTableProps {
  reloadKey?: number;
  onEditUser: (user: any) => void;
}
export function UserDataTable({ reloadKey, onEditUser }: UserTableProps) {
  // const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  const [userData, setUserData] = React.useState<any>({
    users: [],
    totalUsers: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [role, setRole] = React.useState<string>("all");
  const [pagination, setPagination] = React.useState({
    pageIndex: (userData.page || 1) - 1,
    pageSize: userData.limit || 10,
  });

  const editUser = (user: any) => {
    if (!user) return;
    onEditUser(user);
  };

  const fetchData = async (
    pageIndex: number,
    pageSize: number,
    search?: string,
    roleFilter?: string
  ) => {
    setLoading(true);
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const users = response.data.data || [];

      setUserData({
        users,
        totalUsers: users.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchData(pagination.pageIndex, pagination.pageSize, searchQuery, role);
  }, [reloadKey]);

  const deleteUser = async (userId: string) => {
    if (!userId) return;

    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
    try {
      await toast.promise(
        axios.delete(`/api/users?id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        {
          loading: "Deleting user...",
          success: "User deleted successfully",
          error: "Failed to delete user",
        }
      );

      fetchData(pagination.pageIndex, pagination.pageSize, searchQuery, role);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong while deleting user");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchData(0, pagination.pageSize, query, role);
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    fetchData(0, pagination.pageSize, searchQuery, newRole);
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
    fetchData(pageIndex, pageSize, searchQuery, role);
  };

  React.useEffect(() => {
    fetchData(pagination.pageIndex, pagination.pageSize, searchQuery, role);
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "fullName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        if (!user) return null;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {user.picture ? (
                <Image
                  src={getImageSrc(user.picture)}
                  alt="admin test"
                  width={100}
                  height={100}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },

    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.original?.email || "N/A"}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <div>{row.original?.role || "N/A"}</div>,
    },
    {
      accessorKey: "Tenant",
      header: "Tenant",
      cell: ({ row }) => <div>{row?.original?.tenant?.name || "N/A"}</div>,
    },

    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }) => <div>{formatDate(row.original.lastLogin)}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
    },
    // Actions column
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <MoreVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => editUser(row.original)}>
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => row.original?._id && deleteUser(row.original._id)}
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const status = {
    name: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Disable", value: "disabled" },
    ],
    value: role,
    onChange: handleRoleChange,
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={userData.users || []}
        loading={loading}
        pageCount={userData.totalPages || 1}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalItems={userData.totalUsers || 0}
        searchPlaceholder="Search user..."
        onSearch={handleSearch}
        filterOptions={status}
        enableSelection={false}
        enableColumnVisibility={true}
        enablePagination={true}
        onPaginationChange={handlePaginationChange}
        getRowId={(row) => row._id || String(Math.random())}
        emptyMessage="No users found."
        loadingMessage="Loading user..."
      />
    </>
  );
}
