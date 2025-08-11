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
import { Switch } from "@/components/ui/switch";

interface Group {
  _id: string;
  name: string;
  description: string;
  phoneNumber: string;
  users: { _id: string; name: string; picture?: string }[];
  tenant: any;
  isActive?: boolean;
  createdAt: string;
}

interface GroupDataTableProps {
  reloadKey?: number;
  tenantId?: string | null;
  onEditGroup: (group: Group) => void;
}

export function GroupDataTable({ reloadKey, tenantId, onEditGroup }: GroupDataTableProps) {
  const [loading, setLoading] = React.useState(false);
  const [groupData, setGroupData] = React.useState<{
    groups: Group[];
    totalGroups: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    groups: [],
    totalGroups: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [switchLoading, setSwitchLoading] = React.useState(false);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = async (
    pageIndex: number,
    pageSize: number,
    search?: string
  ) => {
    setLoading(true);
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

      const params = new URLSearchParams();
      if (tenantId) params.append("tenantId", tenantId);
      params.append("page", (pageIndex + 1).toString());
      params.append("limit", pageSize.toString());

      if (search) params.append("search", search);

      const response = await axios.get(`/api/group?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data, pagination } = response.data;

      setGroupData({
        groups: data,
        totalGroups: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      });

      setPagination({
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      });
    } catch (error) {
      console.error("Failed to fetch group data:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData(pagination.pageIndex, pagination.pageSize, searchQuery);
  }, [reloadKey, tenantId, pagination.pageIndex, pagination.pageSize]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchData(0, pagination.pageSize, query);
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
    fetchData(pageIndex, pageSize, searchQuery);
  };

  const editGroup = (group: Group) => {
    if (!groupData) return;
    onEditGroup(group);
  };

  const deleteGroup = async (groupId: string) => {
    if (!groupId) return;

    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
    try {
      await toast.promise(
        axios.delete(`/api/group?id=${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        {
          loading: "Deleting group...",
          success: "Group deleted successfully",
          error: "Failed to delete group",
        }
      );
      fetchData(pagination.pageIndex, pagination.pageSize, searchQuery);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong while deleting group");
    }
  };
  const handleToggle = async (user: any) => {
    setSwitchLoading(true);
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

    try {
      await axios.put(`/api/group?id=${user._id}`, {
        isActive: !user.isActive,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`User ${!user.isActive ? "activated" : "deactivated"} successfully`);
      fetchData(pagination.pageIndex, pagination.pageSize, searchQuery);
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setSwitchLoading(false);
    }
  };


  const columns: ColumnDef<Group>[] = [
    {
      accessorKey: "name",
      header: "Group Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.original.description || "-"}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => <div>{row.original.phoneNumber || "-"}</div>,
    },
    {
      accessorKey: "users",
      header: "Users",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.users?.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs"
              title={user.name}
            >
              {user.picture ? (
                <Image
                  src={getImageSrc(user.picture)}
                  alt={user.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
              )}
              <span>{user.name}</span>
            </div>
          )) || "-"}
        </div>
      ),
    },

    {
      accessorKey: "tenant",
      header: "Tenant",
      cell: ({ row }) => <div>{row.original.tenant?.name || "-"}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => <div>{row.original.phoneNumber || "-"}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const groupData = row.original;
        return (
          <Switch
            checked={row.original?.isActive || false}
            disabled={switchLoading}
            onCheckedChange={() => handleToggle(groupData)}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
    },
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
            <DropdownMenuItem onClick={() => editGroup(row.original)}>
              Edit Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => deleteGroup(row.original._id)}
            >
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  
  return (
    <DataTable
      columns={columns}
      data={groupData.groups}
      loading={loading}
      pageCount={groupData.totalPages}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      totalItems={groupData.totalGroups}
      searchPlaceholder="Search groups..."
      onSearch={handleSearch}
      enableSelection={false}
      enableColumnVisibility={true}
      enablePagination={true}
      onPaginationChange={handlePaginationChange}
      getRowId={(row) => row._id}
      emptyMessage="No groups found."
      loadingMessage="Loading groups..."
    />
  );
}
