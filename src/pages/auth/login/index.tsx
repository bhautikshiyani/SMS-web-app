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
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import AuthLayout from '@/components/layout/auth-layout'
// import ComponentsAuthLoginForm from '@/components/auth/ComponentsAuthLoginForm'

const formSchema = loginFormSchema

export default function LoginPreview() {
    const router = useRouter()
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
            localStorage.setItem('token', token)
            toast.success('Login successful!')
            router.push('/messages')
        } catch (error: any) {
            console.error(error)
            const message = error?.response?.data?.message || 'Login failed.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Handler for Google login success
    async function handleGoogleSuccess(credentialResponse: any) {
        setIsLoading(true)
        try {
            console.log('Google login request body:', process.env.GOOGLE_CLIENT_ID)

            const res = await axios.post('/api/auth/google', {
                token: credentialResponse.credential,
            })
            const { token } = res.data
            localStorage.setItem('token', token)
            toast.success('Google login successful!')
            router.push('/messages')
        } catch (error: any) {
            // console.error('Google login failed:', error)
            toast.error(error?.response?.data?.message || 'Google login failed')
        } finally {
            setIsLoading(false)
        }
    }

    // Handler for Google login failure
    function handleGoogleError() {
        toast.error('Google login failed. Please try again.')
    }

    return (
        <>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
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
                    <div className="relative my-7 text-center ">
                        <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                        <span className="relative px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                    </div>
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                        />
                    </div>

                </AuthLayout>

            </GoogleOAuthProvider>


            {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
                    <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
                        <div className="flex-1 bg-indigo-100/35 text-center hidden lg:flex">
                            <div
                                className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
                                style={{
                                    backgroundImage:
                                        "url('/—Pngtree—future technology china telecom mobile_7134652.png')",
                                }}
                            />
                        </div>
                        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                            <div className="flex justify-center">
                                <img
                                    src="/images/logo/top-grade-telecom.png"
                                    alt="Logo"
                                    width={128}
                                    height={32}
                                />
                            </div>
                            <div className="mt-12 flex flex-col items-center">
                                <h1 className="text-2xl xl:text-2xl font-extrabold">Sign in</h1>
                                <div className="w-full flex-1 mt-8">
                                    <div className="mx-auto max-w-xs space-y-5">
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                                                        href="/auth/forgetPassword"
                                                                        className="ml-auto inline-block text-sm underline text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        Forgot your password?
                                                                    </Link>
                                                                </div>
                                                                <FormControl>
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

                                        <div className="flex justify-center mt-4">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                useOneTap
                                            />
                                        </div>

                                        <p className="text-xs text-gray-600 text-center">
                                            I agree to abide by templatana's{' '}
                                            <a href="#" className="underline">
                                                Terms of Service
                                            </a>{' '}
                                            and{' '}
                                            <a href="#" className="underline">
                                                Privacy Policy
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GoogleOAuthProvider> */}
        </>
    )
}
