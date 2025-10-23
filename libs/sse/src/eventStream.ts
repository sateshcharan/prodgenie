import { Request, Response } from 'express';

type SSEClient = {
  id: string; // socket / connection id
  workspaceId: string;
  res: Response;
  lastEventId?: string | null;
};

const clients = new Map<string, SSEClient>(); // key = client.id

// helper to format SSE message
const sseMessage = (id: string | number | null, event: string, data: any) => {
  const chunks: string[] = [];
  if (id !== null && id !== undefined) chunks.push(`id: ${String(id)}`);
  if (event) chunks.push(`event: ${event}`);
  // send data as JSON lines (SSE allows multiple `data:` lines; keep single line JSON)
  chunks.push(`data: ${JSON.stringify(data)}`);
  return chunks.join('\n') + '\n\n';
};

export function subscribe(req: Request, res: Response, next?: () => void) {
  try {
    const { workspaceId } = req.params;
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Optional: last-event-id header support
    const lastEventId =
      req.header('Last-Event-ID') ?? req.query.lastEventId ?? null;

    // set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Allow CORS from your front-end origin (or set via global CORS middleware)
    res.setHeader('Access-Control-Allow-Origin', '*'); // tighten for prod

    // initial 200 + flush
    res.flushHeaders?.();

    const client: SSEClient = {
      id: clientId,
      workspaceId,
      res,
      lastEventId: lastEventId as string | null,
    };
    clients.set(clientId, client);

    // Send a handshake / welcome (optional)
    res.write(sseMessage(null, 'connected', { clientId, workspaceId }));

    // heartbeat ping to keep connection alive (client and proxies)
    const keepAliveInterval = setInterval(() => {
      try {
        res.write(': ping\n\n'); // comment line is allowed in SSE - cheap keepalive
      } catch {
        // ignore write errors
      }
    }, 20_000); // 20s

    // cleanup on client disconnect
    req.on('close', () => {
      clearInterval(keepAliveInterval);
      clients.delete(clientId);
    });

    if (next) next();
  } catch (err) {
    console.error('SSE subscribe error', err);
    res.status(500).end();
  }
}

export function publish(
  workspaceId: string,
  eventName: string,
  payload: any,
  id?: string | number
) {
  // Broadcast to all clients in workspace
  for (const [clientId, client] of clients) {
    if (client.workspaceId !== workspaceId) continue;
    try {
      client.res.write(sseMessage(id ?? Date.now(), eventName, payload));
    } catch (err) {
      // if write fails, remove client
      client.res.end();
      clients.delete(clientId);
    }
  }
}

// For testing / admin: count subscribers
export function countClients(workspaceId?: string) {
  if (!workspaceId) return clients.size;
  let c = 0;
  for (const client of clients.values())
    if (client.workspaceId === workspaceId) c++;
  return c;
}
