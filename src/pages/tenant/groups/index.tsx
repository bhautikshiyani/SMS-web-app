"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GroupAddFormType } from "@/types/validation/validationSchema";
import { PlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AddGroup } from "@/components/admin/groups/add-group";
import { GroupDataTable } from "@/components/admin/groups/group-table";



const Group = () => {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? "";

  const initialValues: GroupAddFormType = {
    name: "",
    description: "",
    phoneNumber: '',
    users: [],
    tenantId: tenantId,
    picture: null,
  };

  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupAddFormType | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleAddClick = () => {
    setEditingGroup(initialValues);
    setOpenGroupModal(true);
  };

  const handleSuccess = () => {
    setOpenGroupModal(false);
    setReloadKey((prev) => prev + 1);
  };

  const handleEditGroup = (group: any) => {
    const mappedGroup: GroupAddFormType = {
      _id: group._id,
      name: group.name || "",
      phoneNumber: group.phoneNumber || "",
      users:
        group.users?.map((user: any) => ({
          label: user.name,
          value: user._id,
        })) || [],
      tenantId: group.tenantId || tenantId,
      picture: group.picture || null,
      description: group.description || "",
    };

    setEditingGroup(mappedGroup);
    setOpenGroupModal(true);
  };

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Groups</h2>
        <Button onClick={handleAddClick} className="cursor-pointer">
          <PlusIcon className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      <GroupDataTable
        tenantId={tenantId}
        reloadKey={reloadKey}
        onEditGroup={handleEditGroup}
      />

      <AddGroup
        open={openGroupModal}
        setOpen={setOpenGroupModal}
        initialData={editingGroup ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Group;
