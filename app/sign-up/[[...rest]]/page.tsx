import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center bg-background p-8 lg:p-12">
        <div className="w-full max-w-md">
          <SignUp
            routing="path"
            path="/sign-up"
            fallbackRedirectUrl="/"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                socialButtonsRoot: 'hidden',
                socialButtonsBlockButton: 'hidden',
                socialButtonsIconButton: 'hidden',
                dividerRow: 'hidden',
              },
            }}
          />
        </div>
      </div>

      <div className="relative hidden flex-1 overflow-hidden bg-green-950 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.22),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.18),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-green-50">
          <div className="flex items-center gap-3">
            <Image
              src="/DMartBrandon_logo.png"
              alt="DMartBrandon"
              width={192}
              height={76}
              priority
              className="h-12 w-auto rounded-lg bg-white/90 p-1"
            />
          </div>

          <div>
            <p className="eyebrow text-green-300">Join the harvest</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">
              Farm-fresh produce,
              <br />
              delivered in 24 hours.
            </h2>
            <p className="mt-4 max-w-md text-sm text-green-200/80">
              Create an account to unlock weekly deals, save your favourite
              picks, and skip the queue at checkout.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-green-200/80">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Verified farms
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Transparent pricing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
