import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/client';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput, userSchema } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

export function LoginPage() {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } });

  const mut = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const user = userSchema.parse(res.user);
      setSession(user, res.token);
      nav('/');
    }
  });

  return (
    <div className="mx-auto mt-20 max-w-md">
      <Card>
        <CardHeader><CardTitle>登录</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={form.handleSubmit((v) => mut.mutate(v))}>
            <Input placeholder="账号: user/creator/admin" {...form.register('identifier')} />
            <Input type="password" placeholder="密码: 123456" {...form.register('password')} />
            <Button type="submit" className="w-full">登录</Button>
          </form>
          <p className="mt-3 text-sm">还没有账号？<Link to="/register" className="text-primary">注册</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', handle: '', password: '' } });

  const mut = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      const user = userSchema.parse(res.user);
      setSession(user, res.token);
      nav('/');
    }
  });

  return (
    <div className="mx-auto mt-20 max-w-md">
      <Card>
        <CardHeader><CardTitle>注册</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={form.handleSubmit((v) => mut.mutate(v))}>
            <Input placeholder="姓名" {...form.register('name')} />
            <Input placeholder="handle" {...form.register('handle')} />
            <Input type="password" placeholder="密码" {...form.register('password')} />
            <Button type="submit" className="w-full">创建账号</Button>
          </form>
          <p className="mt-3 text-sm">已有账号？<Link to="/login" className="text-primary">登录</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
