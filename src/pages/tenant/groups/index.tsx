"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GroupAddFormType } from "@/types/validation/validationSchema";
import { PlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AddGroup } from "@/components/admin/groups/add-group";
import { GroupDataTable } from "@/components/admin/groups/group-table";

const Group = () => {
  const [openUserModal, setOpenUserModal] = useState(false);
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const initialValues: GroupAddFormType = {
    name: "",
    phone: "",
    assignedUsers: [],
    tenantId: tenantId ?? "",
    picture: null,
  
  };
  const [editingUser, setEditingUser] =
    useState<Partial<GroupAddFormType> | null>(initialValues);
  const [reloadKey, setReloadKey] = useState(0);

  const handleAddClick = () => {
    setEditingUser(initialValues);
    setOpenUserModal(true);
  };

  const handleSuccess = () => {
    setOpenUserModal(false);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gropus</h2>
          <Button className="cursor-pointer" onClick={handleAddClick}>
            <PlusIcon className="h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      <GroupDataTable
        tenantId={tenantId}
        reloadKey={reloadKey}
        onEditUser={(user) => {
          setEditingUser(user);
          setOpenUserModal(true);
        }}
      />

      <AddGroup
        open={openUserModal}
        setOpen={setOpenUserModal}
        initialData={editingUser || undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
export default Group