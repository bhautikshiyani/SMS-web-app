'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { Input } from '@/components/ui/input'
import { emailSchema } from '@/lib/schema/validation-schemas'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layout/auth-layout'


// Schema for email validation
const formSchema = z.object({
  email: emailSchema,
})

export default function ForgotPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to send reset email.')
      }

      toast.success('Password reset email sent. Please check your inbox.')
      form.reset()
    } catch (error: any) {
      console.error('Error sending password reset email', error)
      toast.error(error.message || 'Something went wrong.')
    }
  }

  return (

    <AuthLayout>
      <div className="mb-6 mt-8">
        <h1 className="text-2xl   font-extrabold uppercase !leading-snug text-primary ">Forgot Password</h1>
        <p className="text-base  leading-normal text-white-dark"> Enter your email address to receive a password reset link.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
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
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
