"use client";

import { useEffect } from "react";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/common/profile-uploader";
import { Switch } from "@/components/ui/switch";
import { TenantFormType, tenantSchema } from "@/types/validation/validationSchema";

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
  const form = useForm<TenantFormType>({
    resolver: zodResolver(tenantSchema) as any, 
    defaultValues: {
      name: "",
      logoUrl: null,
      sinchApiKey: "",
      sinchApiSecret: "",
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
        logoUrl: initialData.logoUrl || null,
        sinchApiKey: initialData.sinchApiKey || "",
        sinchApiSecret: initialData.sinchApiSecret || "",
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]  ">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update tenant details." : "Create a new tenant."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Logo uploader */}
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <FileUploader value={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CloudReach" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sinch API Key */}
            <FormField
              control={form.control}
              name="sinchApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinch API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Sinch API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sinch API Secret */}
            <FormField
              control={form.control}
              name="sinchApiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinch API Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Sinch API Secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Retention Period */}
            <FormField
              control={form.control}
              name="retentionPeriodYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retention Period (Years)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      value={field.value || 1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Feature Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="featureToggles.messages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Messages</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featureToggles.contacts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Contacts</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featureToggles.voicemail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Voicemail</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featureToggles.phone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Phone</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{initialData ? "Update" : "Add"} Tenant</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}