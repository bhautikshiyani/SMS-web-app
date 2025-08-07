'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { PhoneInput } from '@/components/ui/phone-input'
import { registerFormSchema } from '@/lib/schema/validation-schemas'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AuthLayout from '@/components/layout/auth-layout'

const formSchema = registerFormSchema.extend({
    tenantId: z.string().min(1, 'Tenant is required'),
})

export default function Register() {
    const router = useRouter()
    const [tenants, setTenants] = useState<{ _id: string; name: string }[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            tenantId: '',
        },
    })

    useEffect(() => {
        async function fetchTenants() {
            try {
                const res = await axios.get('/api/tenants')
                setTenants(res.data.data)
            } catch (err) {
                console.error('Failed to fetch tenants', err)
                toast.error('Unable to load tenants')
            }
        }

        fetchTenants()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await axios.post('/api/auth/register', values)

            if (response.status === 201 || response.status === 200) {
                toast.success('Registration successful! Please log in.')
                router.push('/auth/login')
            } else {
                toast.error('Registration failed. Please try again.')
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Registration failed.'
            toast.error(msg)
        }
    }

    return (

        <AuthLayout>
            <div className="mb-10">
                <h1 className="text-2xl md:text-3xl font-extrabold uppercase !leading-snug text-primary ">Register</h1>
                <p className="text-base font-bold leading-normal text-white-dark">Create a new account by filling out the form below.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-4">

                        

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
                                        <Select  onValueChange={field.onChange} value={field.value}>
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

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </div>
                </form>
            </Form>

            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="underline">
                    Login
                </Link>
            </div>
        </AuthLayout>

    )
}
