'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { loginFormSchema } from '@/lib/schema/validation-schemas'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Loading from '@/components/common/Loading'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AuthLayout from '@/components/layout/auth-layout'
import Cookies from 'js-cookie'
// import { useAppDispatch, useAppSelector } from '@/store/hooks'

const formSchema = loginFormSchema

export default function LoginPreview() {
    const router = useRouter()
    // const dispatch = useAppDispatch()
    // const { loading } = useAppSelector((state) => state.auth)

    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await axios.post('/api/auth/login', values)
            const { token } = res.data
            Cookies.set(process.env.NEXT_PUBLIC_TOKEN_KEY, token);
            toast.success('Login successful!')
            router.push('/')
        } catch (error: any) {
            console.error(error)
            const message = error?.response?.data?.message || 'Login failed.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }
    // async function handleGoogleSuccess(credentialResponse: any) {
    //     setIsLoading(true)
    //     try {
    //         console.log('Google login request body:', process.env.GOOGLE_CLIENT_ID)

    //         const res = await axios.post('/api/auth/google', {
    //             token: credentialResponse.credential,
    //         })
    //         const { token } = res.data


    //         toast.success('Google login successful!')
    //         router.push('/messages')
    //     } catch (error: any) {
    //         // console.error('Google login failed:', error)
    //         toast.error(error?.response?.data?.message || 'Google login failed')
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    // // Handler for Google login failure
    // function handleGoogleError() {
    //     toast.error('Google login failed. Please try again.')
    // }

    // async function handleGoogleSuccess(credentialResponse: any) {
    //     setIsLoading(true)
    //     try {
    //         console.log('Google login request body:', process.env.GOOGLE_CLIENT_ID)

    //         const res = await axios.post('/api/auth/google', {
    //             token: credentialResponse.credential,
    //         })
    //         const { token } = res.data
    //         localStorage.setItem('token', token)
    //         toast.success('Google login successful!')
    //         router.push('/messages')
    //     } catch (error: any) {
    //         toast.error(error?.response?.data?.message || 'Google login failed')
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    // function handleGoogleError() {
    //     toast.error('Google login failed. Please try again.')
    // }

    return (
        <>
            {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}> */}
                <AuthLayout>
                    <div className="mb-10">
                        <h1 className="text-2xl md:text-3xl font-extrabold uppercase !leading-snug text-primary ">Sign in</h1>
                        <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 dark:text-white">
                            <div className="grid gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="grid gap-2">
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
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Password</FormLabel>
                                                <Link
                                                    href="/auth/forgotPassword"
                                                    className="ml-auto inline-block text-sm underline text-gray-500 hover:text-gray-800"
                                                >
                                                    Forgot your password?
                                                </Link>
                                            </div>
                                            <FormControl >


                                                <PasswordInput
                                                    placeholder="******"
                                                    autoComplete="current-password"
                                                    {...field}
                                                />

                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loading />
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                  

                </AuthLayout>

            {/* </GoogleOAuthProvider> */}


        </>
    )
}
