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
import { Input } from '@/components/ui/input'
import { emailSchema } from '@/lib/schema/validation-schemas'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layout/auth-layout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearMessages, forgotPassword } from '@/store/slices/authSlice'
import { useEffect } from 'react'


const formSchema = z.object({
  email: emailSchema,
})

export default function ForgotPassword() {
  const dispatch = useAppDispatch()
  const {  error, successMessage } = useAppSelector((state) => state.auth)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })  

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    dispatch(forgotPassword(values.email))
  }
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
      form.reset()
      dispatch(clearMessages())
    }

    if (error) {
      toast.error(error)
      dispatch(clearMessages())
    }
  }, [successMessage, error, dispatch, form])


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
