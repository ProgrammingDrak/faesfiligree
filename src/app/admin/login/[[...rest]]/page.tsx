import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Admin Sign In",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl text-warm-white">Admin Portal</h1>
        <p className="text-warm-white/50 text-sm mt-1">Fae&apos;s Filigree</p>
      </div>

      {denied && (
        <div className="w-full max-w-sm mb-4 rounded-lg border border-rose-gold/40 bg-rose-gold/10 px-4 py-3 text-center text-sm text-rose-gold">
          That account isn&apos;t authorized for the admin portal.
        </div>
      )}

      <SignIn
        routing="path"
        path="/admin/login"
        signUpUrl="/admin/login"
        fallbackRedirectUrl="/admin"
        forceRedirectUrl="/admin"
      />

      <p className="text-warm-white/30 text-xs mt-6 max-w-sm text-center">
        Enter your authorized email to receive a one-time sign-in code.
      </p>
    </div>
  );
}
