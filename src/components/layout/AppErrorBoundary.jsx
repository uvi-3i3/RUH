import React from 'react';
import { hapticDestructive, hapticNavigate } from '../../utils/haptics';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Ruh Sanctuary recovered from error:', error, errorInfo);
  }

  handleReload = () => {
    hapticNavigate();
    window.location.reload();
  };

  handleResetAndReload = () => {
    hapticDestructive();
    try {
      localStorage.removeItem('ruh_devotion_state');
      localStorage.removeItem('ruh_sent_notifications_v1');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen bg-[#080c16] text-[#f5eee0] flex flex-col items-center justify-center px-6 text-center select-none">
          <span className="font-calligraphy text-4xl text-[#d2a24b] mb-3" dir="rtl">
            رُوح
          </span>
          <h1 className="font-serif-eng text-xl tracking-[0.14em] uppercase mb-2">
            Sanctuary Paused
          </h1>
          <p className="font-serif-eng text-sm text-[#e4dac8]/75 max-w-sm leading-relaxed mb-6">
            A temporary state mismatch interrupted rendering. You can reload normally or clear cached session state if the issue persists.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-[#d2a24b]/20 border border-[#d2a24b]/50 text-[#f3d9a4] font-serif-eng text-xs uppercase tracking-[0.16em] cursor-pointer"
            >
              Reload App
            </button>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="px-5 py-2.5 rounded-xl border border-white/15 text-[#e4dac8]/80 font-serif-eng text-xs uppercase tracking-[0.16em] cursor-pointer"
            >
              Reset Local Cache
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
