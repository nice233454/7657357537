import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function openCallbackModal() {
  window.dispatchEvent(new CustomEvent('open-callback-modal'));
}

export default function CallbackModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-callback-modal', handler);
    return () => window.removeEventListener('open-callback-modal', handler);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-modal-in">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <span className="text-2xl leading-none">&times;</span>
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Заказать звонок</h3>
        <p className="text-gray-500 text-sm mb-5">Оставьте номер и мы перезвоним в течение 5 минут</p>
        <form onSubmit={(e) => { e.preventDefault(); setOpen(false); alert('Заявка отправлена!'); }}>
          <input
            type="tel"
            placeholder="+7 (___) ___-__-__"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-3"
            required
          />
          <input
            type="text"
            placeholder="Ваше имя"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4"
          />
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Позвоните мне
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
