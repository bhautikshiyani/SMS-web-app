"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { TenantFormType } from "@/types/validation/validationSchema";
import { PlusIcon } from "lucide-react";
import { AddTenant } from "@/components/admin/tenant/add-tenant";
import { TenantDataTable } from "@/components/admin/tenant/tenant-table";

export const tenantInitialValues: TenantFormType = {
  name: "",
  // logoUrl: null,
  // sinchApiKey: "",
  // sinchApiSecret: "",
  address: "",
  email: "",
  phone: "",
  retentionPeriodYears: 1,
  featureToggles: {
    messages: false,
    contacts: false,
    voicemail: false,
    phone: false,
  },
};

const Tenant = () => {
  const [openTenantModal, setOpenTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] =
    useState<Partial<TenantFormType> | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleAddClick = () => {
    setEditingTenant(null);
    setOpenTenantModal(true);
  };

  const handleSuccess = () => {
    setOpenTenantModal(false);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tenants</h2>
          <Button className="cursor-pointer" onClick={handleAddClick}>
            <PlusIcon className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <TenantDataTable
        reloadKey={reloadKey}
        onEditTenant={(tenant) => {
          setEditingTenant(tenant);
          setOpenTenantModal(true);
        }}
      />

      <AddTenant
        open={openTenantModal}
        setOpen={setOpenTenantModal}
        initialData={editingTenant || undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Tenant;