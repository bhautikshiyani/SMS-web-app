'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useSearchParams, useRouter } from 'next/navigation'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import { resetPasswordFormSchema } from '@/lib/schema/validation-schemas'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layout/auth-layout'


const formSchema = resetPasswordFormSchema

export default function ResetPassword() {
    const searchParams = useSearchParams()

    const router = useRouter()
    const token = searchParams.get('token') || ''

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!token) {
            toast.error('Reset token is missing or invalid.')
            return
        }

        try {
            const res = await fetch(`/api/auth/resetPassword?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword: values.password,
                    confirmPassword: values.confirmPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || 'Failed to reset the password.')
                return
            }

            toast.success('Password reset successful! You can now log in.')
            router.push('/auth/login')
        } catch (error) {
            console.error('Error resetting password', error)
            toast.error('Failed to reset the password. Please try again.')
        }
    }


    return (
      
                    <AuthLayout>
                       <div className="mb-10">
                        <h1 className="text-2xl md:text-3xl font-extrabold uppercase !leading-snug text-primary ">Reset Password</h1>
                        <p className="text-base font-bold leading-normal text-white-dark">Enter your new password to reset your password.</p>
                    </div> 
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="grid gap-4">
                                    {/* New Password Field */}
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

                                    {/* Confirm Password Field */}
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel htmlFor="confirmPassword">
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        id="confirmPassword"
                                                        placeholder="******"
                                                        autoComplete="new-password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full">
                                        Reset Password
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </AuthLayout>

              
    )
}
