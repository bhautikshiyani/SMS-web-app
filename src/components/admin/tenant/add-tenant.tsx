"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TenantFormType, tenantSchema } from "@/types/validation/validationSchema";
import TenantForm from "./tenant-form";
import Loading from "@/components/common/Loading";

interface AddTenantProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Partial<TenantFormType & { _id?: string }>;
  onSuccess?: () => void;
}

export function AddTenant({
  open,
  setOpen,
  initialData,
  onSuccess,
}: AddTenantProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<TenantFormType>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: {
      name: "",
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
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        retentionPeriodYears: initialData.retentionPeriodYears || 1,
        featureToggles: {
          messages: initialData.featureToggles?.messages || false,
          contacts: initialData.featureToggles?.contacts || false,
          voicemail: initialData.featureToggles?.voicemail || false,
          phone: initialData.featureToggles?.phone || false,
        },
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: TenantFormType) {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put(`/api/tenants?id=${initialData._id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Tenant updated successfully");
      } else {
        await axios.post("/api/tenants", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Tenant created successfully");
      }
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update tenant details." : "Create a new tenant."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
            <TenantForm form={form} />

            <DialogFooter>
              <DialogClose asChild>
                <Button className="cursor-pointer" type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button className="cursor-pointer" type="submit" disabled={loading}>
                {loading
                  ? initialData
                    ?
                    <>
                      <Loading />
                      Updating...
                    </>
                    :
                    <>
                      <Loading />
                      Creating...
                    </>
                  : initialData
                    ? "Update"
                    : "Add"} Tenant
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
