"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput } from "@/components/ui/phone-input";
import Cookies from "js-cookie";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/useAppDispatch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
});

const phoneAssignmentSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  assignedToType: z.enum(["user", "group"]),
  assignedToId: z.string().min(1, "User/Group ID is required"),
});
const settingsSchema = z.object({
  name: z.string().min(2, "Admin name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
    .optional(),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
});

type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;
type PhoneAssignmentFormValues = z.infer<typeof phoneAssignmentSchema>;
type SettingsFormValues = z.infer<typeof settingsSchema>;

export const tenantInitialValues: SettingsFormValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export const SettingsPage = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: tenantInitialValues,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;


  const apiConfigForm = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
    },
  });

  const phoneAssignmentForm = useForm<PhoneAssignmentFormValues>({
    resolver: zodResolver(phoneAssignmentSchema),
    defaultValues: {
      phoneNumber: "",
      tenantId: "",
      assignedToType: "user",
      assignedToId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

        const tenantsRes = await fetch("/api/tenants", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tenantsData = await tenantsRes.json();
        if (tenantsData.status === "success") {
          setTenants(tenantsData.data);
        }

        const assignmentsRes = await fetch("/api/global-settings/phone-assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const assignmentsData = await assignmentsRes.json();
        if (assignmentsData.status === "success") {
          setAssignments(assignmentsData.data);
        }

        const apiConfigRes = await fetch("/api/global-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apiConfigData = await apiConfigRes.json();
        console.log("API Config Data:", apiConfigData);
        if (apiConfigData.status === "success" && apiConfigData.data) {
          apiConfigForm.reset({
            apiKey: apiConfigData.data.apiKey,
            apiSecret: "",
          });
        }


      } catch (error) {
        console.error("Failed to fetch settings data:", error);
        toast.error("Failed to load settings data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  async function onSubmit(values: SettingsFormValues) {
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        ...(values.password ? { adminPassword: values.password } : {}),
      };
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings.");
    }
  }

  const handleApiConfigSubmit = async (values: ApiConfigFormValues) => {
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
      const response = await fetch("/api/global-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (data.status === "success") {
        toast.success("API configuration saved successfully");
      } else {
        throw new Error(data.message || "Failed to save API config");
      }
    } catch (error: any) {
      console.error("API Config Error:", error);
      toast.error(error.message || "Failed to save API configuration");
    }
  };

  const handlePhoneAssignmentSubmit = async (values: PhoneAssignmentFormValues) => {
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
      const response = await fetch("/api/global-settings/phone-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Phone number assigned successfully");
        phoneAssignmentForm.reset();
        const assignmentsRes = await fetch("/api/global-settings/phone-assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const assignmentsData = await assignmentsRes.json();
        if (assignmentsData.status === "success") {
          setAssignments(assignmentsData.data);
        }
      } else {
        toast.error(data.message || "Failed to assign phone number");
      }
    } catch (error: any) {
      console.error("Assignment Error:", error);
      toast.error(error.message || "Failed to assign phone number");
    }
  };

  const handleUnassignNumber = async (assignmentId: string) => {
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
      const response = await fetch(`/api/global-settings/phone-assignments?id=${assignmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Phone number unassigned successfully");
        const assignmentsRes = await fetch("/api/global-settings/phone-assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const assignmentsData = await assignmentsRes.json();
        if (assignmentsData.status === "success") {
          setAssignments(assignmentsData.data);
        }
      } else {
        throw new Error(data.message || "Failed to unassign phone number");
      }
    } catch (error: any) {
      console.error("Unassignment Error:", error);
      toast.error(error.message || "Failed to unassign phone number");
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Global Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and phone number assignments
        </p>
      </div>

      <div className="flex w-full flex-col gap-6">
        <Tabs defaultValue="api_config">
          <TabsList>
            {/* <TabsTrigger value="setting">Setting</TabsTrigger> */}
            <TabsTrigger value="api_config">API Configuration</TabsTrigger>
            <TabsTrigger value="num_ass">Number Assignments</TabsTrigger>

          </TabsList>
          {/* <TabsContent value="setting">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="w-full mx-auto space-y-8">
                  <div className="space-y-8">
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Admin Details</h3>
                      </CardHeader>
                      <CardContent className="grid gap-6 md:grid-cols-2">
                        <div>
                          <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
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
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="grid gap-2">
                              <FormLabel htmlFor="password">New Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  id="password"
                                  placeholder="******"
                                  autoComplete="new-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </CardContent>
                      <CardFooter>
                        <div className="flex justify-end mb-3">
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Settings"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>

                  </div>
                </div>
              </form>
            </Form>
          </TabsContent> */}
          <TabsContent value="api_config">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure your telephony provider API credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...apiConfigForm}>
                  <form onSubmit={apiConfigForm.handleSubmit(handleApiConfigSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={apiConfigForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter API key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={apiConfigForm.control}
                        name="apiSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Secret</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder="Enter API secret" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save API Configuration"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="num_ass">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Phone Number</CardTitle>
                  <CardDescription>
                    Assign a phone number to a user or group within a tenant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...phoneAssignmentForm}>
                    <form onSubmit={phoneAssignmentForm.handleSubmit(handlePhoneAssignmentSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={phoneAssignmentForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  placeholder="Enter phone number"
                                  defaultCountry="US"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={phoneAssignmentForm.control}
                          name="tenantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tenant</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a tenant" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tenants.map((tenant) => (
                                    <SelectItem key={tenant._id} value={tenant._id}>
                                      {tenant.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={phoneAssignmentForm.control}
                          name="assignedToType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assign To</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="group">Group</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={phoneAssignmentForm.control}
                          name="assignedToId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User/Group ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter user or group ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                                    {/* <FormField
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
                                    /> */}
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Assigning..." : "Assign Number"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Assignments</CardTitle>
                  <CardDescription>
                    View and manage current phone number assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Assigned On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment._id}>
                          <TableCell>{assignment.phoneNumber}</TableCell>
                          <TableCell>{assignment.tenant?.name}</TableCell>
                          <TableCell>
                            {assignment.assignedToType === "user"
                              ? assignment.assignedTo?.name
                              : assignment.assignedTo?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.assignedToType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.isActive ? "default" : "destructive"}>
                              {assignment.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUnassignNumber(assignment._id)}
                              disabled={isLoading}
                            >
                              Unassign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>


      {/* <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "api" ? "default" : "outline"}
          onClick={() => setActiveTab("api")}
        >
          API Configuration
        </Button>
        <Button
          variant={activeTab === "assignments" ? "default" : "outline"}
          onClick={() => setActiveTab("assignments")}
        >
          Number Assignments
        </Button>
      </div> */}

      {/* {activeTab === "api" && (
       
      )}

      {activeTab === "assignments" && (
       
      )} */}
    </div>
  );
};

export default SettingsPage;