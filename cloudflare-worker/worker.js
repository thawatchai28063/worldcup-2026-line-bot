const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzL01fl3Ap-AgKBDFc6zxYmG_DVndrfULgj7rY3ONm2E6WyFc8tZ3m1tzMpVLFcytQA/exec';

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      return jsonResponse({
        ok: true,
        service: 'worldcup-2026-line-bot-worker',
        message: 'LINE webhook proxy is running.'
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, message: 'Method not allowed' }, 405);
    }

    try {
      const body = await request.text();
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'application/json',
          'X-Line-Signature': request.headers.get('X-Line-Signature') || ''
        },
        body,
        redirect: 'follow'
      });

      const text = await response.text();
      if (!response.ok) {
        return jsonResponse({
          ok: false,
          upstreamStatus: response.status,
          upstreamBody: text.slice(0, 500)
        }, 200);
      }

      return new Response(text || JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      });
    } catch (error) {
      return jsonResponse({
        ok: false,
        message: error.message || String(error)
      }, 200);
    }
  }
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
