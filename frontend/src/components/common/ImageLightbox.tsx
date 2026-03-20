import { useEffect, useCallback, useRef } from 'react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Суретті үлкейту"
    >
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
        aria-label="Жабу"
      >
        &times;
      </button>
      <img
        src={src}
        alt={alt || 'Үлкейтілген сурет'}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
