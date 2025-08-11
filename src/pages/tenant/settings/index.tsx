'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import TenantForm from "@/components/admin/tenant/tenant-form";
import { TenantFormType, tenantSchema } from "@/types/validation/validationSchema";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import  { LoadingComponntScreen } from "@/components/common/LoadingScreen";




export default function CompanySettingsPage() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // for form submission
  const form = useForm<TenantFormType>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      // sinchApiKey: "",
      // sinchApiSecret: "",
      retentionPeriodYears: 1,
      featureToggles: {
        messages: false,
        contacts: false,
        voicemail: false,
        phone: false,
      },
    },
  });
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);

      const response = await axios.get(`/api/tenants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: tenantId,
        },
      });
      const data = response.data.data;

      form.reset({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        retentionPeriodYears: data.retentionPeriodYears || 1,
        featureToggles: {
          messages: data.featureToggles?.messages || false,
          contacts: data.featureToggles?.contacts || false,
          voicemail: data.featureToggles?.voicemail || false,
          phone: data.featureToggles?.phone || false,
        },
      });
    } catch (error) {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (tenantId) {
      fetchTenants();
    }
  }, [tenantId]);


  async function onSubmit(values: TenantFormType) {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY!);
    setSubmitting(true);
    try {
      await axios.put(`/api/tenants?id=${tenantId}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tenant updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }
  // if(loading){
  //   return(
  //     <LoadingComponntScreen />
  //   )
  // }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col justify-start gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Company</h2>
              <Button className="cursor-pointer" type="submit" disabled={submitting}>
                {submitting ?
                  <>
                    <Loading />
                    Saving...
                  </>
                  :
                  "Save Changes"}
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <TenantForm form={form} />
          </div>
        </div>
      </form>
    </Form>
  );
}
