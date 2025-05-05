'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InsertUser, InsertUserMutation } from '@/graphql/types';
import { authClient } from '@/lib/auth-client';
import fetchClient from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDictionary } from './dictionary-provider';
import { LanguageToggle } from './lang-toggle';
import { Alert } from './ui/alert';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const t = useDictionary();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<undefined | string>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const clearInputs = () => {
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const onLogin = async () => {
    if (!email || !password) {
      setError(t.Global.all_fields_are_required);
      return;
    }

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    });
    if (error) {
      console.log(error);
      if (error.code === 'INVALID_EMAIL' || error.code === 'INVALID_EMAIL_OR_PASSWORD') {
        setError(t.Global.invalid_email);
        return;
      }
      setError(error.message);
    }
  };

  const onRegister = async () => {
    if (!username || !email || !password) {
      setError(t.Global.all_fields_are_required);
      return;
    }

    await authClient.signUp.email(
      {
        email,
        password,
        name: username,
        callbackURL: '/dashboard',
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          const res = await fetchClient<InsertUserMutation>({
            query: InsertUser,
            variables: {
              email,
              username: username,
              role_id: 1,
            },
          });
          if (res) {
            router.push('/dashboard');
          }
        },
        onError: (ctx) => {
          console.log(ctx);
          if (ctx.error.code === 'USER_ALREADY_EXISTS') {
            setError(t.Global.user_exists);
            setLoading(false);
            return;
          }
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t.Global.login_welcome}</CardTitle>
          <CardDescription>{t.Global.login_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              {/* <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button>
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
              </div> */}
              {login === 'login' ? (
                <>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">{t.Global.email}</Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">{t.Global.password}</Label>
                        <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                          {t.Global.forgot_password}?
                        </a>
                      </div>
                      <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" required />
                    </div>
                    {error && (
                      <Alert data-slot="alert" className="w-full" variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                      </Alert>
                    )}
                    <Button
                      onClick={() => {
                        onLogin();
                      }}
                      type="submit"
                      className="w-full"
                    >
                      {t.Global.login}
                    </Button>
                  </div>
                  <div className="text-center text-sm cursor-pointer">
                    {t.Global.no_account}{' '}
                    <span
                      onClick={() => {
                        clearInputs();
                        setLogin('register');
                      }}
                      className="underline underline-offset-4"
                    >
                      {t.Global.register}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">{t.Global.username}</Label>
                      <Input value={username} onChange={(e) => setUsername(e.target.value)} id="username" type="text" required />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="email">{t.Global.email}</Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">{t.Global.password}</Label>
                      </div>
                      <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" required />
                    </div>
                    {error && (
                      <Alert data-slot="alert" className="w-full" variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                      </Alert>
                    )}
                    <Button disabled={loading} type="submit" className="w-full" onClick={() => onRegister()}>
                      {t.Global.register}
                    </Button>
                  </div>
                  <div className="text-center text-sm cursor-pointer">
                    {t.Global.have_account}{' '}
                    <span
                      onClick={() => {
                        clearInputs();
                        setLogin('login');
                      }}
                      className="underline underline-offset-4"
                    >
                      {t.Global.login}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div> */}
      <div className="flex items-center justify-center">
        <LanguageToggle />
      </div>
    </div>
  );
}
