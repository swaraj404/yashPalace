import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Inbox, LayoutDashboard, ListChecks, Settings as Gear } from 'lucide-react';
import { api, setSignedOutHandler } from './api';
import { buildDayMap } from './derive';
import { BlockSheet, BookingSheet } from './Forms';
import Login from './Login';
import { Bookings, CalendarView, Enquiries, Overview, Settings } from './Views';
import { Btn } from './ui';
import Crest from '../components/ui/Crest';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'bookings', label: 'Bookings', icon: ListChecks },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
  { id: 'settings', label: 'Settings', icon: Gear },
];

const tabFromHash = () => {
  const id = location.hash.slice(1);
  return TABS.some((t) => t.id === id) ? id : 'overview';
};

function Dashboard({ username, onSignedOut }) {
  const [tab, setTab] = useState(tabFromHash);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const next = await api('/data');
    setData(next);
    setLoadError('');
  }, []);

  const retry = useCallback(() => {
    load().catch((err) => setLoadError(err.message));
  }, [load]);

  useEffect(retry, [retry]);

  useEffect(() => {
    const onHash = () => {
      setTab(tabFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const closeSheet = useCallback(() => setSheet(null), []);

  const saved = useCallback(async (message) => {
    setSheet(null);
    setToast(message);
    await load().catch((err) => setLoadError(err.message));
  }, [load]);

  const signOut = useCallback(async () => {
    await api('/logout', { method: 'POST' }).catch(() => {});
    onSignedOut();
  }, [onSignedOut]);

  const actions = useMemo(() => ({
    newBooking: (draft) => setSheet({ type: 'booking', draft }),
    editBooking: (booking) => setSheet({ type: 'booking', booking }),
    closeDates: (startDate) => setSheet({ type: 'block', startDate }),
    saved,
    toast: setToast,
    signOut,
  }), [saved, signOut]);

  const dayMap = useMemo(
    () => (data ? buildDayMap(data.bookings, data.blocks) : new Map()),
    [data]
  );
  const newCount = data?.enquiries.filter((e) => e.status === 'new').length ?? 0;
  const view = { data, dayMap, actions };

  const tabLink = (t, mobile) => (
    <a
      key={t.id}
      href={`#${t.id}`}
      aria-current={tab === t.id ? 'page' : undefined}
      className={mobile
        ? `relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium ${tab === t.id ? 'text-gold-glow' : 'text-ivory/75'}`
        : `relative flex min-h-11 items-center gap-2 rounded px-3 text-sm font-medium ${tab === t.id ? 'bg-white/10 text-gold-glow' : 'text-ivory/80 hover:text-ivory'}`}
    >
      <t.icon size={mobile ? 20 : 16} />
      {t.label}
      {t.id === 'enquiries' && newCount > 0 && (
        <span className={`rounded bg-gold-glow px-1.5 text-xs font-bold text-green-950 ${mobile ? 'absolute right-1 top-1' : ''}`}>
          {newCount}
        </span>
      )}
    </a>
  );

  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="bg-green-900 text-ivory">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#overview" className="flex items-center gap-2.5">
            <Crest className="h-10 w-8 text-lg" />
            <span className="font-serif text-2xl font-semibold">Yash Palace</span>
          </a>
          <nav aria-label="Dashboard" className="hidden gap-1 md:flex">{TABS.map((t) => tabLink(t, false))}</nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        {loadError && !data && (
          <div role="alert" className="rounded bg-sindoor/10 p-4 text-sindoor">
            <p className="mb-3">{loadError}</p>
            <Btn onClick={retry}>Try again</Btn>
          </div>
        )}
        {!data && !loadError && (
          <div className="grid animate-pulse gap-4" aria-label="Loading">
            <div className="h-12 w-56 rounded bg-ivory-2" />
            <div className="h-24 rounded bg-ivory-2" />
            <div className="h-64 rounded bg-ivory-2" />
          </div>
        )}
        {data && (
          <>
            {tab === 'overview' && <Overview {...view} />}
            {tab === 'calendar' && <CalendarView {...view} />}
            {tab === 'bookings' && <Bookings {...view} />}
            {tab === 'enquiries' && <Enquiries {...view} />}
            {tab === 'settings' && <Settings username={username} actions={actions} />}
          </>
        )}
      </main>

      <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 bg-green-900 pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map((t) => tabLink(t, true))}
      </nav>

      {sheet?.type === 'booking' && (
        <BookingSheet booking={sheet.booking} draft={sheet.draft} onClose={closeSheet} onSaved={saved} />
      )}
      {sheet?.type === 'block' && (
        <BlockSheet startDate={sheet.startDate} onClose={closeSheet} onSaved={saved} />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6">
        {toast && <p className="rounded bg-green-950 px-4 py-3 text-sm text-ivory shadow-lg">{toast}</p>}
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState({ state: 'checking' });
  const signedOut = useCallback(() => setSession({ state: 'out' }), []);

  useEffect(() => {
    setSignedOutHandler(signedOut);
    api('/me')
      .then((me) => setSession({ state: 'in', username: me.username }))
      .catch(signedOut);
  }, [signedOut]);

  if (session.state === 'checking') return <div className="min-h-dvh bg-ivory" aria-busy="true" />;
  if (session.state === 'out') {
    return <Login onDone={(username) => setSession({ state: 'in', username })} />;
  }
  return <Dashboard username={session.username} onSignedOut={signedOut} />;
}
