import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/forms/auth.form';
import ClearLocalStorage from '@/components/customs/clear-localstorage';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Wind, Bell } from 'lucide-react';

const LoginPageContent = async () => {
  const cookieStore = await cookies();

  const authToken = cookieStore.get('_auth_token_')?.value;
  // const passkeyToken = cookieStore.get('_passkey_token_')?.value;
  const sessionId = cookieStore.get('sessionId')?.value;

  if (authToken && sessionId) {
    redirect('/dashboard');
  }

  // if (authToken && passkeyToken && sessionId) {
  //   redirect('/dashboard');
  // }

  // if (authToken && !passkeyToken) {
  //   redirect('/passkey');
  // }

  return (
    <div className="flex min-h-screen font-mono bg-[var(--color-background)] text-[var(--color-foreground)]">
      <ClearLocalStorage />

      {/* Left side - branding and info */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-12 relative overflow-hidden">
        <div className="space-y-8 relative z-0">
          {/* Logo and header */}
          <div className="flex items-center gap-4">
            <img
              src="/images/autofeather-logo.png"
              alt="AutoFeather Logo"
              className="w-16 h-16 rounded-lg border border-[var(--color-border)] shadow-sm"
            />
            <div>
              <h1 className="text-4xl font-bold text-[var(--color-card-foreground)]">
                AutoFeather
              </h1>
              <p className="text-[var(--color-muted-foreground)] font-medium mt-1">
                Real-Time Poultry Monitoring and Automation
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[var(--color-muted-foreground)] max-w-md leading-relaxed">
            Monitor feather growth, thermal comfort, egg fertility, and automate
            environmental controls efficiently with AutoFeather.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <Card className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-accent)] transition">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 bg-[var(--color-secondary)] rounded-lg">
                  <Activity className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[var(--color-card-foreground)]">
                    Feather Density Tracking
                  </h3>
                  <p className="text-[var(--color-muted-foreground)] text-sm">
                    Track feather coverage to ensure bird health and detect
                    stress or disease early.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-accent)] transition">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 bg-[var(--color-secondary)] rounded-lg">
                  <Wind className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[var(--color-card-foreground)]">
                    Thermal Comfort Monitoring
                  </h3>
                  <p className="text-[var(--color-muted-foreground)] text-sm">
                    Maintain optimal temperature and ventilation to reduce
                    stress and improve productivity.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-accent)] transition">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 bg-[var(--color-secondary)] rounded-lg">
                  <Bell className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[var(--color-card-foreground)]">
                    Alerts & Notifications
                  </h3>
                  <p className="text-[var(--color-muted-foreground)] text-sm">
                    Receive instant alerts for critical environmental changes or
                    system malfunctions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-10 relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-[var(--color-background)]/80 z-0" />

        {/* Login form container */}
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-card-foreground)]">
              AutoFeather Login
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              Access your account to manage and monitor your poultry systems.
            </p>
          </div>

          {/* Form */}
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPageContent;
