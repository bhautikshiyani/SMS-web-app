"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { FileUploader } from "../../common/profile-uploader";
import {
  GroupAddFormType,
  groupAddSchema,
} from "@/types/validation/validationSchema";
import MultipleSelector from "@/components/ui/multiple-selector";
import { PhoneInput } from "@/components/ui/phone-input";

interface AddGroupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Partial<GroupAddFormType & { _id?: string }>;
  onSuccess?: () => void;
}

export function AddGroup({ open, setOpen, initialData, onSuccess }: AddGroupProps) {
  const [tenants, setTenants] = useState<{ _id: string; name: string }[]>([]);
  const [user, setUser] = useState<{ _id: string; name: string }[]>([]);
  const form = useForm<GroupAddFormType>({
    resolver: zodResolver(groupAddSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await axios.get("/api/tenants");
        setTenants(res.data.data);
      } catch (err) {
        console.log("🚀 ~ fetchTenants ~ err:", err)
      }
    }
    fetchTenants();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

      try {
        const res = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.data);
      } catch (err) {
        console.log("🚀 ~ fetchTenants ~ err:", err)
      }
    }
    fetchUsers();
  }, []);


  async function onSubmit(values: z.infer<typeof groupAddSchema>) {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
    const userIds = Array.isArray(values.users)
      ? values.users.map((user) => (typeof user === 'string' ? user : user.value))
      : [];

    const payload = {
      ...values,
      users: userIds,
    };

    try {
      if (initialData?._id) {
        await axios.put(`/api/group?id=${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User updated successfully");
      } else {
        await axios.post("/api/group", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User created successfully");
      }
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Operation failed.";
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData?._id ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {initialData?._id ? "Update user details." : "Create a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <FileUploader value={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="users"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add User</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      defaultOptions={user.map((user) => ({
                        label: user.name,
                        value: user._id,
                      }))}
                      placeholder="Select users..."
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <PhoneInput {...field} defaultCountry="IN" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <FormControl>
                    <Select disabled onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant._id} value={tenant._id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : initialData?._id ? (
                  "Update"
                ) : (
                  "Create Group"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
