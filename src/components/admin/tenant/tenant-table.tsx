"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVerticalIcon } from "lucide-react";
import Image from "next/image";
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

interface TenantTableProps {
  reloadKey?: number;
  onEditTenant: (tenant: any) => void;
}

export function TenantDataTable({ reloadKey, onEditTenant }: TenantTableProps) {
  const [loading, setLoading] = React.useState(false);
  const [tenantData, setTenantData] = React.useState<any>({
    tenants: [],
    totalTenants: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

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
      });

      const tenants = response.data.data || [];

      setTenantData({
        tenants,
        totalTenants: tenants.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    } catch (error) {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

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
            {tenant.logoUrl ? (
              <img
                src={getImageSrc(tenant?.logoUrl)}
                alt="Tenant logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-muted" />
            )}
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
      accessorKey: "sinchApiKey",
      header: "Sinch API Key",
      cell: ({ row }) => row.original.sinchApiKey || "N/A",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditTenant(row.original)}>
              Edit Tenant
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => row.original._id && deleteTenant(row.original._id)}
              className="text-red-600"
            >
              Delete Tenant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
      onSearch={() => {}} // Optional: Add search logic
      enableSelection={false}
      enableColumnVisibility={true}
      enablePagination={true}
      onPaginationChange={(pageIndex, pageSize) =>
        setPagination({ pageIndex, pageSize })
      }
      getRowId={(row) => row._id || String(Math.random())}
      emptyMessage="No tenants found."
      loadingMessage="Loading tenants..."
    />
  );
}
