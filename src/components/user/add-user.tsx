"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { registerFormSchema } from "@/lib/schema/validation-schemas";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Cookies from 'js-cookie';
import { PlusIcon } from "lucide-react";
import { FileUploader } from "../common/profile-uploader";
import {
  UserAddFormType,
  userAddSchema,
} from "@/types/validation/validationSchema";
import { roles } from "@/lib/constants";

const initialValues: UserAddFormType = {
  name: "",
  email: "",
  phone: "",
  tenantId: "",
  picture: null,
  role: "OrgUser",
};

export function AddUser() {
  const [tenants, setTenants] = useState<{ _id: string; name: string }[]>([]);
  const form = useForm<UserAddFormType>({
    resolver: zodResolver(userAddSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await axios.get("/api/tenants");
        setTenants(res.data.data);
      } catch (err) {
        console.error("Failed to fetch tenants", err);
        toast.error("Unable to load tenants");
      }
    }

    fetchTenants();
  }, []);

  async function onSubmit(values: z.infer<typeof userAddSchema>) {
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

      const response = await axios.post("/api/users", values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Create User successful! Please log in.");
      } else {
        toast.error("Create User failed. Please try again.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Create User failed.";
      toast.error(msg);
    }
  }

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="h-4 w-4" />
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create user profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="picture"
                  render={({ field }) => (
                    <div className="space-y-6">
                      <FormItem className="w-full">
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <FileUploader
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
                {/* </div> */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} defaultCountry="IN" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="cursor-pointer" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button className="cursor-pointer" type="submit">Add User</Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog>
  );
}
