import React from 'react'

const AuthLayout = ({ children }: {
    children: any;
}) => {
    return (
        <div>
            <div className="fixed inset-0">
                <img src="/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-6 dark:bg-[#060818] sm:px-16">
                <img src="/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[670px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 px-6 py-8 md:py-10 2xl:py-20 backdrop-blur-lg dark:bg-black/50 ">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="flex justify-center mb-3">
                                <img
                                    className="dark:hidden block"
                                    src="/images/logo/top-grade-telecom.png"
                                    alt="Logo"
                                    width={128}
                                    height={32}
                                />
                                <img
                                    className='hidden dark:block'
                                    src="/images/logo/top-grade-telecom-white.png"
                                    alt="Logo"
                                    width={128}
                                    height={32}
                                />
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout   