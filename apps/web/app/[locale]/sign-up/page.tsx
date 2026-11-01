import { SignUp } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteLogo } from '../components/site-header';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign up – ExcelPanda',
};

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/continue");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center px-6 py-8">
      <div className="flex w-full max-w-5xl items-center justify-between">
        <SiteLogo />
        <Link
          href="/"
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#1F4D3A]/5"
        >
          ← Back home
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <h1 className="text-center text-4xl font-bold tracking-tight text-[#1F4D3A] sm:text-5xl">
          Master{' '}
          <span className="rounded-2xl bg-[#C7F000] px-3 text-[#1F4D3A]">
            Excel
          </span>
        </h1>
        <p className="mt-4 max-w-md text-center text-base text-[#1F4D3A]/70 sm:text-lg">
          Create your free account and start learning by doing.
        </p>
        <div className="mt-8">
          <SignUp
            routing="hash"
            signInUrl="/sign-in"
            forceRedirectUrl="/continue"
            signInForceRedirectUrl="/continue"
            appearance={{
              variables: { colorBackground: '#ffffff' },
              elements: {
                cardBox: 'shadow-none rounded-3xl border-2 border-[#1F4D3A]/10 border-b-4 bg-white',
                card: 'bg-white shadow-none',
                footer: 'bg-white bg-none',
                footerAction: 'bg-white',
                otpCodeFieldInput: '!bg-[#F1F3F0] !border-[#1F4D3A]/20 !text-black',
                otpCodeField: 'bg-transparent',
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
