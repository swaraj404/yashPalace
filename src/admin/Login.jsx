import { useState } from 'react';
import { api } from './api';
import { deriveLoginKey } from '../../shared/password';
import { Btn, Input } from './ui';

export default function Login({ onDone }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const username = form.get('username');
      const loginKey = await deriveLoginKey(username, form.get('password'));
      const me = await api('/login', { method: 'POST', body: { username, loginKey } });
      onDone(me.username);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-green-900 lg:block">
        <img src="/images/venue/arches-portrait.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="grid w-full max-w-sm gap-5">
          <div>
            <p className="font-serif text-xl italic text-gold">Yash Palace</p>
            <h1 className="font-serif text-5xl font-semibold leading-none text-green-800">Owner sign in</h1>
          </div>
          <Input id="username" name="username" label="Username" autoComplete="username" autoCapitalize="none" required />
          <Input id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
          {error && <p role="alert" className="rounded bg-sindoor/10 p-3 text-sm text-sindoor">{error}</p>}
          <Btn type="submit" tone="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
        </form>
      </div>
    </main>
  );
}
