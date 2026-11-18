import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BookingDateContext = createContext(null);

export function BookingDateProvider({ children }) {
  const [date, setDate] = useState('');
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(() => ({ date, setDate, version, refresh }), [date, version, refresh]);
  return <BookingDateContext.Provider value={value}>{children}</BookingDateContext.Provider>;
}

export const useBookingDate = () => useContext(BookingDateContext);
