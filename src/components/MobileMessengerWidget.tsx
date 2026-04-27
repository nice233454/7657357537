import { useState, useEffect, useCallback } from 'react';

export default function MobileMessengerWidget() {
  const [active, setActive] = useState<'tg' | 'max'>('tg');
  const [swapping, setSwapping] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const swap = useCallback(() => {
    setSwapping(true);
    setTimeout(() => {
      setActive((prev) => (prev === 'tg' ? 'max' : 'tg'));
      setSwapping(false);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(swap, 3500);
    return () => clearInterval(interval);
  }, [swap]);

  if (dismissed) return null;

  return (
    <div className="lg:hidden fixed bottom-5 right-4 z-50 flex flex-col items-center">
      {/* Label pill */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-3 py-1.5 mb-2 animate-fade-up">
        <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">Напишите нам</span>
      </div>

      {/* Swapping messenger button */}
      <div className="relative w-14 h-14">
        <a
          href={active === 'tg' ? 'https://t.me/' : 'https://max.ru/'}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute inset-0 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            swapping ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          } ${
            active === 'tg'
              ? 'bg-[#26A5E4] shadow-sky-500/40'
              : 'bg-white shadow-gray-400/30 border border-gray-100'
          }`}
          aria-label={active === 'tg' ? 'Telegram' : 'Макс'}
        >
          {active === 'tg' ? (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Z" fill="#26A5E4"/>
              <path d="m5.432 11.873 8.37-3.543c.389-.17 1.435-.56 1.435-.56s.643-.248.577.389c-.022.248-.166 1.092-.31 2.024l-.918 5.448s-.067.499-.411.576c-.344.078-.877-.21-.877-.21l-3.876-2.588s-.277-.166-.022-.388c.255-.222.576-.499.576-.499l4.397-3.21s.255-.166.022-.255c-.233-.089-.833.022-1.268.277l-5.37 3.487s-.478.222-.855-.022c-.377-.244.011-.744.011-.744Z" fill="#fff"/>
            </svg>
          ) : (
            <img
              src="https://i.postimg.cc/2jh9VbFn/Logotip-MAX-svg.webp"
              alt="Макс"
              className="w-7 h-7 object-contain"
            />
          )}
        </a>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="mt-1.5 w-5 h-5 rounded-full bg-gray-800/70 text-white/70 flex items-center justify-center text-[10px] leading-none hover:bg-gray-700 transition-colors"
      >
        &times;
      </button>
    </div>
  );
}
