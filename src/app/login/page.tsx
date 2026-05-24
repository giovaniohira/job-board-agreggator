import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_45%)]" />

      <Card className="relative w-full max-w-md border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/80">
            JobPulse
          </p>
          <CardTitle className="text-2xl tracking-tight">Private access</CardTitle>
          <CardDescription>
            Single-user job aggregation dashboard. Public registration is disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error === "unauthorized" && (
            <p className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              Your account is not authorized for this application.
            </p>
          )}

          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
