// components/DeleteTenantModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface DeleteTenantModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  onDeleted: () => void;
}

const DeleteTenantModal = ({
  open,
  onClose,
  tenantId,
  tenantName,
  onDeleted,
}: DeleteTenantModalProps) => {
  const [input, setInput] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    setIsMatching(input.trim() === tenantName);
  }, [input, tenantName]);

  const handleDelete = async () => {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

    try {
      await toast.promise(
        axios.delete(`/api/tenants/${tenantId}`, {
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

      onDeleted();
      onClose();
      setInput("");
    } catch (error) {
      toast.error("Something went wrong while deleting tenant");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Tenant Deletion</DialogTitle>
        </DialogHeader>
        <p>
          Type the tenant's name <strong>"{tenantName}"</strong> to confirm
          deletion.
        </p>
        <Input
          placeholder="Enter tenant name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <DialogFooter className="mt-4">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            variant="destructive"
            disabled={!isMatching}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTenantModal;
