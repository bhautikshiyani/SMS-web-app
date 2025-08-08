"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddUser } from "@/components/admin/user/add-user";
import { UserDataTable } from "@/components/admin/user/user-table";
import { UserAddFormType } from "@/types/validation/validationSchema";
import { PlusIcon } from "lucide-react";
const initialValues: UserAddFormType = {
  name: "",
  email: "",
  phone: "",
  tenantId: "",
  picture: null,
  role: "OrgUser",
};
const UserPage = () => {
  const [openUserModal, setOpenUserModal] = useState(false);
  const [editingUser, setEditingUser] =
    useState<Partial<UserAddFormType> | null>(initialValues);
    const [reloadKey, setReloadKey] = useState(0);
    console.log("🚀 ~ UserPage ~ editingUser:", editingUser)

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
          <h2 className="text-2xl font-bold">User</h2>
          <Button className="cursor-pointer" onClick={handleAddClick}>
            <PlusIcon className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <UserDataTable
        reloadKey={reloadKey}
        onEditUser={(user) => {
          setEditingUser(user);
          setOpenUserModal(true);
        }}
      />

      <AddUser
        open={openUserModal}
        setOpen={setOpenUserModal}
        initialData={editingUser || undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default UserPage;
