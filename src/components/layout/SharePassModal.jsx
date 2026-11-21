import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircleIcon, ShareIcon, XIcon } from '../icons/Icons';
import {
  SHARE_FORMATS,
  SHARE_SKY_MODES,
  buildSanctuaryShareCaption,
  buildShareFilename,
  buildSocialShareLinks,
  resolveAppShareUrl,
  resolveShareSkyMode,
} from '../../utils/sharePassLogic';
import { renderSanctuaryShareCanvas } from '../../utils/sharePassCanvas';
import {
  hapticDetent,
  hapticDismiss,
  hapticNavigate,
  hapticSuccess,
  hapticToggle,
} from '../../utils/haptics';

const FINISH_OPTIONS = [
  { id: 'ivory', label: 'Ivory' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'emerald', label: 'Emerald' },
];

const DownloadIcon = ({ size = 15, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.65"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CopyIcon = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.65"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const SharePassModal = ({
  isOpen,
  initialFinish = 'obsidian',
  isLightMode = false,
  cardData,
  onClose,
}) => {
  const [formatId, setFormatId] = useState('story');
  const [finish, setFinish] = useState(initialFinish);
  const [skyMode, setSkyMode] = useState(() =>
    resolveShareSkyMode({ isLightMode, finish: initialFinish })
  );
  const [showName, setShowName] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);

  const canvasRef = useRef(null);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const nextFinish = initialFinish || (isLightMode ? 'ivory' : 'obsidian');
      setFinish(nextFinish);
      setSkyMode(resolveShareSkyMode({ isLightMode, finish: nextFinish }));
      setStatusMessage('');
      setCopiedCaption(false);
    }
  }, [isOpen, initialFinish, isLightMode]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const appShare = useMemo(
    () =>
      resolveAppShareUrl(
        typeof window !== 'undefined' ? window.location.origin : ''
      ),
    []
  );

  const shareCaption = useMemo(
    () =>
      buildSanctuaryShareCaption({
        holderName: cardData?.holderName,
        showName,
        stationName: cardData?.stationName,
        stationNumeral: cardData?.stationNumeral,
        currentStreak: cardData?.currentStreak,
        totalPrayers: cardData?.totalPrayers,
        totalVerses: cardData?.totalVerses,
        unlockedBadges: cardData?.unlockedBadges,
        totalBadges: cardData?.totalBadges,
        appUrl: appShare.url,
      }),
    [cardData, showName, appShare.url]
  );

  const socialLinks = useMemo(
    () => buildSocialShareLinks({ caption: shareCaption, url: appShare.url }),
    [shareCaption, appShare.url]
  );

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    renderSanctuaryShareCanvas(canvasRef.current, {
      formatId,
      finish,
      skyMode,
      showName,
      holderName: cardData?.holderName,
      initials: cardData?.initials,
      passId: cardData?.passId,
      joinedYear: cardData?.joinedYear,
      hijriFormatted: cardData?.hijriFormatted,
      hijriDayMonth: cardData?.hijriDayMonth,
      stationNumeral: cardData?.stationNumeral,
      stationName: cardData?.stationName,
      stationSubtitle: cardData?.stationSubtitle,
      stationArabic: cardData?.stationArabic,
      yaqeenPct: cardData?.yaqeenPct,
      currentStreak: cardData?.currentStreak,
      longestStreak: cardData?.longestStreak,
      totalPrayers: cardData?.totalPrayers,
      totalVerses: cardData?.totalVerses,
      unlockedBadges: cardData?.unlockedBadges,
      totalBadges: cardData?.totalBadges,
      todayActive: cardData?.todayActive,
      todayPaused: cardData?.todayPaused,
      weekDays: cardData?.weekDays,
      mrzLine: cardData?.mrzLine,
      displayHost: appShare.displayHost,
    });
  }, [isOpen, formatId, finish, skyMode, showName, cardData, appShare.displayHost]);

  if (!isOpen) return null;

  const showNotice = (msg) => {
    setStatusMessage(msg);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      setStatusMessage('');
    }, 2600);
  };

  const triggerPngDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const filename = buildShareFilename({ finish, formatId, skyMode });
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      hapticSuccess();
      showNotice('Sanctuary Pass PNG saved');
    } catch {
      showNotice('Unable to export image in this browser');
    }
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    const filename = buildShareFilename({ finish, formatId, skyMode });
    hapticNavigate();

    if (canvas && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob && typeof File !== 'undefined') {
          const file = new File([blob], filename, { type: 'image/png' });
          if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Ruh — Sanctuary Pass',
              text: shareCaption,
              files: [file],
            });
            hapticSuccess();
            showNotice('Shared successfully');
            return;
          }
        }
        await navigator.share({
          title: 'Ruh — Sanctuary Pass',
          text: shareCaption,
          url: appShare.url,
        });
        hapticSuccess();
        showNotice('Shared successfully');
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Graceful fallback: download card PNG + copy caption
    triggerPngDownload();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareCaption).catch(() => {});
      setCopiedCaption(true);
      showNotice('Card PNG saved & caption copied');
    }
  };

  const handleCopyCaption = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      showNotice('Clipboard unavailable here');
      return;
    }
    try {
      await navigator.clipboard.writeText(shareCaption);
      hapticSuccess();
      setCopiedCaption(true);
      showNotice('Caption & invite link copied');
      setTimeout(() => setCopiedCaption(false), 2200);
    } catch {
      showNotice('Could not copy to clipboard');
    }
  };

  const accentHex = isLightMode ? '#845f22' : '#e4c078';
  const tTextMain = isLightMode ? 'text-[#1a1814]' : 'text-[rgba(246,240,228,0.95)]';
  const tTextSub = isLightMode ? 'text-[#473e33]' : 'text-[rgba(224,214,196,0.72)]';
  const hairline = isLightMode ? 'border-black/[0.08]' : 'border-white/[0.09]';
  const surfaceBg = isLightMode
    ? 'bg-[#f6f1e7]/95 border-white/85 shadow-[0_24px_64px_rgba(26,24,20,0.2)]'
    : 'bg-[#0a0e18]/94 border-white/[0.12] shadow-[0_28px_72px_rgba(0,0,0,0.78)]';

  const activeFormatObj = SHARE_FORMATS.find((f) => f.id === formatId) || SHARE_FORMATS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Sanctuary Pass"
      data-testid="share-pass-modal"
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto"
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          hapticDismiss();
          onClose?.();
        }}
        className="absolute inset-0 transition-opacity"
        style={{
          background: isLightMode ? 'rgba(218,228,240,0.52)' : 'rgba(3,6,13,0.68)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Dialog Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-[780px] max-h-[92dvh] rounded-t-[26px] sm:rounded-[26px] border flex flex-col overflow-hidden ${surfaceBg}`}
        style={{
          backdropFilter: 'blur(14px) saturate(130%)',
          WebkitBackdropFilter: 'blur(14px) saturate(130%)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className={`shrink-0 px-5 py-3.5 border-b flex items-center justify-between gap-3 ${hairline}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="font-calligraphy text-[20px] leading-none shrink-0"
              style={{ color: accentHex }}
              dir="rtl"
            >
              رُوح
            </span>
            <div className="min-w-0">
              <h2 className={`font-serif-eng text-[16px] sm:text-[18px] font-medium leading-tight truncate ${tTextMain}`}>
                Share Sanctuary Pass
              </h2>
              <p className={`font-serif-eng text-[11px] leading-tight truncate ${tTextSub}`}>
                Portrait card for Stories, WhatsApp & Feed
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close Share Sanctuary Pass"
            onClick={() => {
              hapticDismiss();
              onClose?.();
            }}
            className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
              isLightMode
                ? 'bg-white/70 border-black/10 text-[#1a1814] hover:bg-white'
                : 'bg-white/[0.06] border-white/12 text-[#f6f0e4] hover:bg-white/[0.12]'
            }`}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content: Responsive 2-Column Studio (Cloud Poster Preview Left, Controls Right) */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-5 items-center">
            {/* Left: Live High-Res Portrait Canvas Preview */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div
                className={`w-full rounded-2xl border p-3 flex items-center justify-center ${
                  isLightMode ? 'bg-[#ebe4d6]/70 border-black/[0.07]' : 'bg-black/35 border-white/[0.07]'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  data-testid="share-pass-canvas"
                  data-format={formatId}
                  data-finish={finish}
                  data-sky={skyMode}
                  data-show-name={showName ? 'true' : 'false'}
                  aria-label="Sanctuary Pass share card preview"
                  className="max-h-[42dvh] sm:max-h-[54dvh] max-w-full w-auto h-auto rounded-2xl shadow-xl block"
                />
              </div>
              <span className={`font-serif-eng text-[10.5px] ${tTextSub} opacity-80`}>
                {activeFormatObj.label} · {activeFormatObj.subtitle} · {activeFormatObj.width}×{activeFormatObj.height}px
              </span>
            </div>

            {/* Right: Customization & Share Channels */}
            <div className="flex flex-col gap-3.5">
              {/* Portrait Format Selector */}
              <div>
                <span className={`block font-serif-eng text-[10px] uppercase tracking-[0.16em] mb-1.5 ${tTextSub}`}>
                  Portrait Size
                </span>
                <div
                  role="tablist"
                  aria-label="Share card format"
                  className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${
                    isLightMode ? 'bg-black/[0.04] border-black/[0.08]' : 'bg-white/[0.04] border-white/[0.08]'
                  }`}
                >
                  {SHARE_FORMATS.map((fmt) => {
                    const active = formatId === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                          hapticDetent();
                          setFormatId(fmt.id);
                        }}
                        className={`min-h-[36px] px-2.5 rounded-lg font-serif-eng text-[11.5px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          active
                            ? isLightMode
                              ? 'bg-white text-[#1a1814] shadow-xs'
                              : 'bg-[#d9ae58]/20 text-[#f2d699]'
                            : `${tTextSub} hover:opacity-100`
                        }`}
                      >
                        {fmt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sky Backdrop & Privacy Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className={`block font-serif-eng text-[10px] uppercase tracking-[0.16em] mb-1.5 ${tTextSub}`}>
                    Cloud Sky
                  </span>
                  <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Cloud sky atmosphere">
                    {SHARE_SKY_MODES.map((opt) => {
                      const active = skyMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => {
                            hapticDetent();
                            setSkyMode(opt.id);
                          }}
                          className={`min-h-[34px] px-2.5 rounded-lg border font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                            active
                              ? isLightMode
                                ? 'bg-[#9c7533]/14 border-[#9c7533]/45 text-[#7a571c] font-semibold'
                                : 'bg-[#d9ae58]/18 border-[#d9ae58]/45 text-[#f2d699] font-semibold'
                              : isLightMode
                                ? 'border-black/10 text-[#473e33] hover:bg-black/[0.03]'
                                : 'border-white/10 text-[#d6cbb7] hover:bg-white/[0.05]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className={`block font-serif-eng text-[10px] uppercase tracking-[0.16em] mb-1.5 ${tTextSub}`}>
                    Privacy
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showName}
                    onClick={() => {
                      hapticToggle(!showName);
                      setShowName((v) => !v);
                    }}
                    className={`min-h-[34px] px-3 rounded-lg border font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                      showName
                        ? isLightMode
                          ? 'bg-[#9c7533]/12 border-[#9c7533]/40 text-[#7a571c]'
                          : 'bg-[#d9ae58]/16 border-[#d9ae58]/40 text-[#f2d699]'
                        : isLightMode
                          ? 'border-black/12 text-[#473e33]'
                          : 'border-white/12 text-[#d6cbb7]'
                    }`}
                  >
                    {showName ? 'Name Visible' : 'Anonymous Pass'}
                  </button>
                </div>
              </div>

              {/* Card Finish Selector */}
              <div>
                <span className={`block font-serif-eng text-[10px] uppercase tracking-[0.16em] mb-1.5 ${tTextSub}`}>
                  Card Finish
                </span>
                <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Export card finish">
                  {FINISH_OPTIONS.map((opt) => {
                    const active = finish === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          hapticDetent();
                          setFinish(opt.id);
                        }}
                        className={`min-h-[34px] px-2.5 rounded-lg border font-serif-eng text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                          active
                            ? isLightMode
                              ? 'bg-[#9c7533]/14 border-[#9c7533]/45 text-[#7a571c] font-semibold'
                              : 'bg-[#d9ae58]/18 border-[#d9ae58]/45 text-[#f2d699] font-semibold'
                            : isLightMode
                              ? 'border-black/10 text-[#473e33] hover:bg-black/[0.03]'
                              : 'border-white/10 text-[#d6cbb7] hover:bg-white/[0.05]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Export Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={triggerPngDownload}
                  className="min-h-[44px] px-3.5 rounded-xl font-serif-eng text-[12px] uppercase tracking-[0.14em] font-medium flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isLightMode ? '#8c6524' : '#d9ae58',
                    color: isLightMode ? '#ffffff' : '#0b0e16',
                  }}
                >
                  <DownloadIcon size={15} />
                  <span>Save PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className={`min-h-[44px] px-3.5 rounded-xl border font-serif-eng text-[12px] uppercase tracking-[0.14em] font-medium flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                    isLightMode
                      ? 'bg-white/75 border-[#9c7533]/35 text-[#7a571c] hover:bg-white'
                      : 'bg-white/[0.06] border-[#d9ae58]/35 text-[#f0d598] hover:bg-white/[0.11]'
                  }`}
                >
                  <ShareIcon size={14} />
                  <span>Share Card</span>
                </button>
              </div>

              {/* Direct Social Share Links & Copy Caption */}
              <div className={`pt-3 border-t ${hairline}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`font-serif-eng text-[10px] uppercase tracking-[0.16em] ${tTextSub}`}>
                    Post to Socials
                  </span>
                  {statusMessage && (
                    <span
                      className="font-serif-eng text-[11px] flex items-center gap-1"
                      style={{ color: accentHex }}
                    >
                      <CheckCircleIcon size={12} />
                      <span>{statusMessage}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <a
                    href={socialLinks.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => hapticNavigate()}
                    className={`min-h-[40px] px-2 rounded-xl border flex items-center justify-center font-serif-eng text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                      isLightMode
                        ? 'bg-white/60 border-black/10 text-[#1a1814] hover:bg-white'
                        : 'bg-white/[0.04] border-white/12 text-[#f6f0e4] hover:bg-white/[0.09]'
                    }`}
                  >
                    X
                  </a>
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => hapticNavigate()}
                    className={`min-h-[40px] px-2 rounded-xl border flex items-center justify-center font-serif-eng text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                      isLightMode
                        ? 'bg-white/60 border-black/10 text-[#1a1814] hover:bg-white'
                        : 'bg-white/[0.04] border-white/12 text-[#f6f0e4] hover:bg-white/[0.09]'
                    }`}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => hapticNavigate()}
                    className={`min-h-[40px] px-2 rounded-xl border flex items-center justify-center font-serif-eng text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                      isLightMode
                        ? 'bg-white/60 border-black/10 text-[#1a1814] hover:bg-white'
                        : 'bg-white/[0.04] border-white/12 text-[#f6f0e4] hover:bg-white/[0.09]'
                    }`}
                  >
                    Telegram
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className={`min-h-[40px] px-2 rounded-xl border flex items-center justify-center gap-1 font-serif-eng text-[11.5px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      copiedCaption
                        ? isLightMode
                          ? 'bg-[#9c7533]/14 border-[#9c7533]/40 text-[#7a571c]'
                          : 'bg-[#d9ae58]/18 border-[#d9ae58]/40 text-[#f2d699]'
                        : isLightMode
                          ? 'bg-white/60 border-black/10 text-[#1a1814] hover:bg-white'
                          : 'bg-white/[0.04] border-white/12 text-[#f6f0e4] hover:bg-white/[0.09]'
                    }`}
                  >
                    {copiedCaption ? <CheckCircleIcon size={13} /> : <CopyIcon size={13} />}
                    <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
