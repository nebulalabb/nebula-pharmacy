import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      // Response expected: { success: true, message: string, data: { user, token } }
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        toast.success('Sign in success!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Login fail');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Connecting server fail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4">
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Nebula Pharmacy
        </h1>
        <p className="text-muted-foreground mt-2">Management System Portal</p>
      </div>

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@nebula.com"
                className="bg-gray-50/50"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium italic">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-gray-50/50"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium italic">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              className="w-full h-11 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            Problems logging in? Please contact Admin.
          </p>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground animate-in fade-in duration-1000 delay-500">
        © 2026 NebulaLab VN. All rights reserved.
      </div>
    </div>
  );
}
