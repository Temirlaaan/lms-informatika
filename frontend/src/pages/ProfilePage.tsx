import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import { useToast } from '../components/common/Toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [gradeClass, setGradeClass] = useState(user?.grade_class ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      if (user?.role === 'student') {
        formData.append('grade_class', gradeClass);
      }
      await updateProfile(formData);
      showToast('Профиль сәтті сақталды', 'success');
    } catch {
      showToast('Профильді сақтау кезінде қате орын алды', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Профиль</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Read-only info */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Логин</span>
            <span className="font-medium text-gray-800">{user.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Рөл</span>
            <span className="font-medium text-gray-800">
              {user.role === 'teacher' ? 'Мұғалім' : 'Оқушы'}
            </span>
          </div>
        </div>

        <hr className="mb-6" />

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Аты-жөні</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          {user.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сынып</label>
              <input
                type="text"
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                placeholder="Мысалы: 5А"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Сақталуда...' : 'Сақтау'}
          </button>
        </form>
      </div>
    </div>
  );
}
