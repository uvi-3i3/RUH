import { createPortal } from 'react-dom';
import { BellIcon, CheckCircleIcon, MoonIcon, SunIcon, XIcon } from '../icons/Icons';

export const SacredNotificationToast = ({
  toast,
  isLightMode = false,
  isAlreadyCompleted = false,
  onMarkPrayed,
  onDismiss,
}) => {
  if (!toast || typeof document === 'undefined') return null;

  const isNightPrayer = toast.prayerId === 'fajr' || toast.prayerId === 'isha';
  const accentHex = isLightMode ? '#9c7533' : '#d2a24b';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(245,238,224,0.96)]';
  const tTextSub = isLightMode ? 'text-[#3a342c]' : 'text-[rgba(228,218,200,0.82)]';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      data-testid="sacred-notification-toast"
      className="fixed inset-x-0 z-[200] flex justify-center px-3 pointer-events-none"
      style={{ top: 'calc(12px + var(--sat))' }}
    >
      <div
        className={`pointer-events-auto relative w-full max-w-[368px] sm:max-w-[408px] rounded-[22px] border overflow-hidden animate-toast-in transition-colors duration-500 ${
          isLightMode
            ? 'bg-[#fcfaf5]/95 border-[#9c7533]/35 shadow-[0_14px_40px_-8px_rgba(26,24,20,0.22)] backdrop-blur-xl'
            : 'bg-[#0b0e16]/95 border-[#d2a24b]/40 shadow-[0_18px_46px_-8px_rgba(0,0,0,0.78)] backdrop-blur-xl'
        }`}
      >
        {/* Subtle Gold Halo Gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isLightMode
              ? 'radial-gradient(circle at 15% 20%, rgba(156,117,51,0.12) 0%, transparent 65%)'
              : 'radial-gradient(circle at 15% 20%, rgba(210,162,75,0.16) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 px-3.5 py-3 flex items-start gap-3">
          {/* Sacred Emblem Vessel */}
          <div
            className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5"
            style={{
              backgroundColor: isLightMode ? 'rgba(156,117,51,0.10)' : 'rgba(210,162,75,0.12)',
              borderColor: isLightMode ? 'rgba(156,117,51,0.28)' : 'rgba(210,162,75,0.32)',
              color: accentHex,
            }}
          >
            {toast.kind === 'prayer' ? (
              isNightPrayer ? (
                <MoonIcon size={17} />
              ) : (
                <SunIcon size={17} />
              )
            ) : (
              <BellIcon size={17} />
            )}
          </div>

          {/* Poetic Copy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="font-calligraphy text-[15px] leading-none shrink-0"
                  style={{ color: accentHex }}
                  dir="rtl"
                >
                  {toast.arabic}
                </span>
                <span className={`text-[10px] opacity-35 ${tTextSub}`} aria-hidden="true">
                  ·
                </span>
                <span className={`font-serif-eng text-[14px] font-medium truncate ${tTextMain}`}>
                  {toast.title}
                </span>
              </div>

              <button
                type="button"
                aria-label="Dismiss prayer notification"
                onClick={onDismiss}
                className={`w-7 h-7 -mr-1 -mt-1 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                  isLightMode ? 'text-[#4a453d]/70 hover:bg-black/5' : 'text-[#e4dac8]/70 hover:bg-white/10'
                }`}
              >
                <XIcon size={14} />
              </button>
            </div>

            <p className={`font-serif-eng italic text-[12px] leading-snug mt-0.5 ${tTextSub}`}>
              {toast.body}
            </p>

            {/* Quick Action Footer */}
            {toast.kind === 'prayer' && toast.prayerId && (
              <div className="flex items-center gap-2 mt-2">
                {isAlreadyCompleted ? (
                  <span
                    className="inline-flex items-center gap-1 font-serif-eng text-[9.5px] uppercase tracking-[0.14em]"
                    style={{ color: accentHex }}
                  >
                    <CheckCircleIcon size={12} />
                    <span>Logged Today</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkPrayed?.(toast.prayerId)}
                    className="min-h-[30px] px-3 rounded-xl border font-serif-eng text-[9px] uppercase tracking-[0.14em] font-medium flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                    style={{
                      backgroundColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.2)',
                      borderColor: isLightMode ? '#9c7533' : 'rgba(210,162,75,0.45)',
                      color: isLightMode ? '#ffffff' : '#f3d9a4',
                    }}
                  >
                    <CheckCircleIcon size={12} />
                    <span>Mark Prayed</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onDismiss}
                  className={`min-h-[30px] px-2.5 rounded-xl font-serif-eng text-[9px] uppercase tracking-[0.14em] cursor-pointer transition-opacity opacity-75 hover:opacity-100 ${tTextSub}`}
                >
                  Later
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtle 12s Shimmer Progress Hairline */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full overflow-hidden"
          style={{
            backgroundColor: isLightMode ? 'rgba(156,117,51,0.1)' : 'rgba(210,162,75,0.12)',
          }}
        >
          <div
            key={toast.shownAt}
            className="h-full origin-left animate-toast-drain"
            style={{ backgroundColor: accentHex, opacity: 0.72 }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
