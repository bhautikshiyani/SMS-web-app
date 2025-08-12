"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Delete, MoreVerticalIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "../../common/DataTable";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { formatDate, getImageSrc } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface TenantTableProps {
  reloadKey?: number;
  onEditTenant: (tenant: any) => void;
}

export function TenantDataTable({ reloadKey, onEditTenant }: TenantTableProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const [tenantData, setTenantData] = React.useState<any>({
    tenants: [],
    totalTenants: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = React.useState("");

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

      const response = await axios.get("/api/tenants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: searchTerm,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        },
      });

      const { data: tenants, meta } = response.data;

      setTenantData({
        tenants,
        totalTenants: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.totalPages,
      });
    } catch (error) {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTenants();
  }, [reloadKey, pagination, searchTerm]);

  React.useEffect(() => {
    fetchTenants();
  }, [reloadKey]);

  const deleteTenant = async (id: string) => {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
    try {
      await toast.promise(
        axios.delete(`/api/tenants?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        {
          loading: "Deleting tenant...",
          success: "Tenant deleted successfully",
          error: "Failed to delete tenant",
        }
      );

      fetchTenants();
    } catch (error) {
      toast.error("Something went wrong while deleting tenant");
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Tenant Name",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="flex items-center gap-3">
            <span>{tenant.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "retentionPeriodYears",
      header: "Retention (Years)",
      cell: ({ row }) => row.original.retentionPeriodYears ?? "N/A",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "N/A",
    },
    {
      accessorKey: "phone",
      header: "phone",
      cell: ({ row }) => row.original.phone || "N/A",
    },
    {
      id: "messages",
      header: "Messages",
      cell: ({ row }) => {
        const val = row.original.featureToggles?.messages;
        return (
          <Badge
            variant="outline"
            className={val ? "text-green-600" : "text-red-600"}
          >
            {val ? "On" : "Off"}
          </Badge>
        );
      },
    },
    {
      id: "contacts",
      header: "Contacts",
      cell: ({ row }) => {
        const val = row.original.featureToggles?.contacts;
        return (
          <Badge
            variant="outline"
            className={val ? "text-green-600" : "text-red-600"}
          >
            {val ? "On" : "Off"}
          </Badge>
        );
      },
    },
    {
      id: "voicemail",
      header: "Voicemail",
      cell: ({ row }) => {
        const val = row.original.featureToggles?.voicemail;
        return (
          <Badge
            variant="outline"
            className={val ? "text-green-600" : "text-red-600"}
          >
            {val ? "On" : "Off"}
          </Badge>
        );
      },
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const val = row.original.featureToggles?.phone;
        return (
          <Badge
            variant="outline"
            className={val ? "text-green-600" : "text-red-600"}
          >
            {val ? "On" : "Off"}
          </Badge>
        );
      },
    },
    // {
    //   accessorKey: "featureToggles",
    //   header: "Features Enabled",
    //   cell: ({ row }) => {
    //     const toggles = row.original.featureToggles || {};
    //     return (
    //       <ul className="text-xs space-y-0.5">
    //         {Object.entries(toggles).map(([key, val]) => (
    //           <li key={key}>
    //             {key}: <span className={val ? "text-green-600" : "text-red-600"}>{val ? "On" : "Off"}</span>
    //           </li>
    //         ))}
    //       </ul>
    //     );
    //   },
    // },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="icon"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // ✅ Prevent row click
            row.original._id && deleteTenant(row.original._id);
          }}
        >
          <Trash />
          <span className="sr-only">Delete Tenant</span>
        </Button>
      ),
    }

  ];

  return (
    <DataTable
      columns={columns}
      data={tenantData.tenants}
      loading={loading}
      pageCount={tenantData.totalPages}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      totalItems={tenantData.totalTenants}
      searchPlaceholder="Search tenants..."
      onSearch={(val: string) => {
        setSearchTerm(val);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }}
      enableSelection={false}
      enableColumnVisibility={true}
      enablePagination={true}
      onPaginationChange={(pageIndex, pageSize) =>
        setPagination({ pageIndex, pageSize })
      }
      getRowId={(row) => row._id || String(Math.random())}
      emptyMessage="No tenants found."
      loadingMessage="Loading tenants..."

      // ✅ Add this to handle row click
      onRowClick={(row) => {
        const id = row._id;
        if (id) router.push(`/admin/tenant/users?tenantId=${id}`);
      }}
    />
  );
}
