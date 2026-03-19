import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    password_confirm: '',
    role: 'student' as const,
    grade_class: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Құпиясөз кемінде 8 таңбадан тұруы керек');
      return;
    }

    if (form.password !== form.password_confirm) {
      setError('Құпиясөздер сәйкес келмейді');
      return;
    }

    if (!form.grade_class) {
      setError('Сынып көрсетілуі тиіс');
      return;
    }

    setLoading(true);
    try {
      await register(form);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: Record<string, string[]> } };
      if (axiosError.response?.data) {
        const messages = Object.values(axiosError.response.data).flat();
        setError(messages.join('. '));
      } else {
        setError('Тіркелу кезінде қате орын алды');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">📚 LMS Информатика</h1>
          <p className="text-muted-foreground mt-2">5 сынып — Информатика пәні</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Тіркелу</CardTitle>
            <CardDescription>Жаңа аккаунт жасау үшін мәліметтерді толтырыңыз</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Аты-жөні</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Құпиясөз</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">Кемінде 8 таңба</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">Құпиясөзді қайталаңыз</Label>
                <Input
                  id="password_confirm"
                  type="password"
                  value={form.password_confirm}
                  onChange={(e) => updateField('password_confirm', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_class">Сынып</Label>
                <Input
                  id="grade_class"
                  type="text"
                  value={form.grade_class}
                  onChange={(e) => updateField('grade_class', e.target.value)}
                  placeholder="Мысалы: 5А"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Күте тұрыңыз...' : 'Тіркелу'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Аккаунтыңыз бар ма?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Кіру
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
