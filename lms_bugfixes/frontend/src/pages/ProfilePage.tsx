import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import { useToast } from '../components/common/Toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [gradeClass, setGradeClass] = useState(user?.grade_class ?? '');
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep form in sync if user changes (e.g., after refreshUser)
  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? '');
      setGradeClass(user.grade_class ?? '');
    }
  }, [user]);

  // Cleanup blob URLs on unmount only
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on unmount — don't revoke on every avatarPreview change

  const handleAvatarSelect = (file: File) => {
    // Validate file size before preview
    if (file.size > 5 * 1024 * 1024) {
      showToast('Файл өте үлкен (макс. 5МБ)', 'error');
      return;
    }

    // Revoke previous preview blob
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      if (user?.role === 'student') {
        formData.append('grade_class', gradeClass);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await updateProfile(formData);

      // Revoke old blob preview before clearing
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh user data to get the new avatar URL
      await refreshUser();

      showToast('Профиль сәтті сақталды', 'success');
    } catch {
      showToast('Профильді сақтау кезінде қате орын алды', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = (user.full_name || user.username).slice(0, 2).toUpperCase();

  // Avatar display logic: preview first, then user avatar with cache busting
  const getDisplayAvatar = (): string | null => {
    if (avatarPreview) return avatarPreview;
    if (user.avatar) {
      // Add cache bust param to force browser to reload after upload
      const separator = user.avatar.includes('?') ? '&' : '?';
      return `${user.avatar}${separator}_=${Date.now()}`;
    }
    return null;
  };
  const displayAvatar = getDisplayAvatar();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-foreground mb-6">Профиль</h1>

      <div className="bg-card rounded-xl shadow-sm p-6 border">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Аватар"
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
                onError={(e) => {
                  // If avatar fails to load, hide it and show initials instead
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback initials — shown when no avatar or avatar fails to load */}
            <div
              className={`w-24 h-24 rounded-full bg-primary text-primary-foreground items-center justify-center text-2xl font-bold ${
                displayAvatar ? 'hidden' : 'flex'
              }`}
            >
              {initials}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarSelect(file);
              }}
            />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mb-6">
          Аватарды өзгерту үшін суретті басыңыз
        </p>

        {/* Read-only info */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Логин</span>
            <span className="font-medium text-foreground">{user.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Рөл</span>
            <span className="font-medium text-foreground">
              {user.role === 'teacher' ? 'Мұғалім' : 'Оқушы'}
            </span>
          </div>
        </div>

        <hr className="mb-6 border-border" />

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Аты-жөні</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          {user.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Сынып</label>
              <input
                type="text"
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                placeholder="Мысалы: 5А"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {saving ? 'Сақталуда...' : 'Сақтау'}
          </button>
        </form>
      </div>
    </div>
  );
}
