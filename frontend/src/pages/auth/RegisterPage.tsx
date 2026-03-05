import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Тіркелу</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Аты-жөні</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Құпиясөз</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">Кемінде 8 таңба</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Құпиясөзді қайталаңыз
            </label>
            <input
              type="password"
              value={form.password_confirm}
              onChange={(e) => updateField('password_confirm', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сынып</label>
            <input
              type="text"
              value={form.grade_class}
              onChange={(e) => updateField('grade_class', e.target.value)}
              placeholder="Мысалы: 5А"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Күте тұрыңыз...' : 'Тіркелу'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Аккаунтыңыз бар ма?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}
