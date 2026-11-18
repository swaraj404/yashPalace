export class ApiError extends Error {
  constructor(message, status, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

let onSignedOut = () => {};
export const setSignedOutHandler = (handler) => {
  onSignedOut = handler;
};

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('No connection. Your changes were not saved.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== '/login') onSignedOut();
    throw new ApiError(data.error ?? 'Something went wrong. Please try again.', res.status, data.field);
  }
  return data;
}
