import { useEffect, useRef } from 'react';

import { apiRoutes } from '@prodgenie/libs/constant';

type OnMessage = (msg: { type: string; payload: any }) => void;

export const useSSE = (workspaceId: string | null, onMessage: OnMessage) => {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    const es = new EventSource(
      `${import.meta.env.VITE_API_URL}${apiRoutes.sse.base}${
        apiRoutes.sse.stream
      }?workspaceId=${workspaceId}`,
      { withCredentials: true }
    );
    esRef.current = es;

    es.addEventListener('open', () => {
      console.log('[SSE] Connection established', workspaceId);
    });

    const handleEvent = (type: string) => (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        console.log(payload);
        onMessage({ type, payload });
      } catch (err) {
        console.error('[SSE] JSON parse error:', err, e.data);
      }
    };

    es.addEventListener('event_created', handleEvent('event_created'));
    es.addEventListener('event_update', handleEvent('event_update'));
    es.addEventListener('event_progress', handleEvent('event_progress'));

    es.onerror = (err) => {
      console.warn('[SSE] Error:', err);
      // browser auto-reconnects by default
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [workspaceId, onMessage]);
};
