import { useState } from 'react';
import type { Topic } from '../../types';

interface TopicFormProps {
  sectionId: number;
  initial?: Topic;
  onSave: (data: { section: number; title: string; order: number; is_published: boolean }) => void;
  onCancel: () => void;
}

export default function TopicForm({ sectionId, initial, onSave, onCancel }: TopicFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ section: sectionId, title, order, is_published: isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border rounded p-3 mb-2 space-y-2">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-1">Тақырып атауы</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Реттілік</label>
          <input
            type="number"
            className="w-20 border rounded px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-1 pb-2">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <span className="text-xs text-muted-foreground">Жарияланған</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
          Сақтау
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 text-foreground px-3 py-1.5 rounded text-sm hover:bg-gray-400">
          Болдырмау
        </button>
      </div>
    </form>
  );
}
