import { useState } from 'react';
import type { Section } from '../../types';

interface SectionFormProps {
  initial?: Section;
  onSave: (data: Partial<Section>) => void;
  onCancel: () => void;
}

export default function SectionForm({ initial, onSave, onCancel }: SectionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, order, icon, is_published: isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-secondary border rounded-lg p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Атауы</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Иконка</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Сипаттама</label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Реттілік</label>
          <input
            type="number"
            className="w-24 border rounded px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 mt-5">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span className="text-sm text-foreground">Жарияланған</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
          Сақтау
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 text-foreground px-4 py-2 rounded text-sm hover:bg-gray-400">
          Болдырмау
        </button>
      </div>
    </form>
  );
}
