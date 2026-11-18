import { apiError, handleApi } from './api.js';

const VIDEO_PATH = '/assets/venue-tour.mp4';

const CSP = {
  public: [
    "default-src 'self'", "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com', "img-src 'self' data:", "media-src 'self'",
    "connect-src 'self'", 'frame-src https://www.google.com https://maps.google.com',
    "base-uri 'self'", "form-action 'self'", "object-src 'none'", "frame-ancestors 'none'",
  ].join('; '),
  admin: [
    "default-src 'self'", "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com', "img-src 'self' data:", "connect-src 'self'",
    "base-uri 'none'", "form-action 'self'", "object-src 'none'", "frame-ancestors 'none'",
  ].join('; '),
};

function describeSite(url, env) {
  const host = url.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
  const isAdminHost = host === env.ADMIN_HOST || (isLocal && host === 'admin.localhost');
  // Before a custom domain is connected, the dashboard lives at /admin on workers.dev.
  const isWorkersDev = host.endsWith('.workers.dev');
  return { isLocal, isAdminHost, isWorkersDev, adminAllowed: isAdminHost || isWorkersDev };
}

async function sendPage(request, env, file, { status = 200, admin = false } = {}) {
  const asset = await env.ASSETS.fetch(new Request(new URL(`/${file}`, request.url)));
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Content-Security-Policy': admin ? CSP.admin : CSP.public,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  if (admin || status === 404) headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(request.method === 'HEAD' ? null : asset.body, { status, headers });
}

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null; // includes multi-range: send it all
  let start;
  let end;
  if (!match[1]) {
    start = Math.max(size - Number(match[2]), 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  return { start, end, valid: start <= end && start < size };
}

// Passes through only the requested bytes, without loading the file into memory.
function clip(start, length) {
  let position = 0;
  let sent = 0;
  return new TransformStream({
    transform(chunk, controller) {
      const from = Math.max(start - position, 0);
      position += chunk.byteLength;
      if (from >= chunk.byteLength) return;
      const piece = chunk.subarray(from, Math.min(chunk.byteLength, from + length - sent));
      controller.enqueue(piece);
      sent += piece.byteLength;
      if (sent >= length) controller.terminate();
    },
  });
}

// Cloudflare sends Content-Length for streams only through FixedLengthStream.
const withLength = (stream, length) =>
  globalThis.FixedLengthStream ? stream.pipeThrough(new FixedLengthStream(length)) : stream;

function knownVideoSize(asset, env) {
  if (asset.headers.get('Content-Encoding')) return 0;
  return Number(asset.headers.get('Content-Length')) || Number(env.HERO_VIDEO_BYTES) || 0;
}

// Cloudflare's static hosting ignores Range headers, but the scroll-driven hero
// video needs them to seek, and Safari will not play video without them.
async function sendVideo(request, env) {
  const asset = await env.ASSETS.fetch(new Request(request.url));
  if (!asset.ok) return asset;

  let size = knownVideoSize(asset, env);
  let buffered = null;
  if (!size) {
    buffered = await asset.arrayBuffer();
    size = buffered.byteLength;
  }

  const etag = asset.headers.get('ETag');
  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
  });
  if (etag) headers.set('ETag', etag);

  const rangeHeader = request.headers.get('Range');
  const ifRange = request.headers.get('If-Range');
  const range = rangeHeader && (!ifRange || ifRange === etag) ? parseRange(rangeHeader, size) : null;
  const isHead = request.method === 'HEAD';
  const discard = () => (buffered ? undefined : asset.body?.cancel());

  if (range && !range.valid) {
    await discard();
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const start = range ? range.start : 0;
  const length = range ? range.end - range.start + 1 : size;
  headers.set('Content-Length', String(length));
  if (range) headers.set('Content-Range', `bytes ${start}-${range.end}/${size}`);
  const status = range ? 206 : 200;

  if (isHead) {
    await discard();
    return new Response(null, { status, headers });
  }
  if (buffered) {
    const body = length === size ? buffered : buffered.slice(start, start + length);
    return new Response(body, { status, headers });
  }
  const source = length === size ? asset.body : asset.body.pipeThrough(clip(start, length));
  return new Response(withLength(source, length), { status, headers });
}

export async function handleRequest(request, env, options) {
  const url = new URL(request.url);
  const site = describeSite(url, env);
  const { pathname: path } = url;

  if (path === '/api' || path.startsWith('/api/')) {
    try {
      return await handleApi(request, env, site, options);
    } catch (error) {
      return apiError(error);
    }
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  if (path === VIDEO_PATH) return sendVideo(request, env);
  if (site.isAdminHost) return sendPage(request, env, 'admin.html', { admin: true });
  if (site.isWorkersDev && (path === '/admin' || path === '/admin/')) {
    return sendPage(request, env, 'admin.html', { admin: true });
  }
  if (path === '/' || path === '/index.html') return sendPage(request, env, 'index.html');
  return sendPage(request, env, '404.html', { status: 404 });
}

export default { fetch: (request, env) => handleRequest(request, env) };
