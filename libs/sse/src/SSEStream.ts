import { Request, Response } from 'express';

type SSEClient = {
  id: string;
  workspaceId: string;
  res: Response;
};

export class SSEServer {
  private clients = new Map<string, SSEClient>();

  private formatMessage(id: string | number | null, event: string, data: any) {
    const chunks: string[] = [];
    if (id !== null && id !== undefined) chunks.push(`id: ${String(id)}`);
    if (event) chunks.push(`event: ${event}`);
    chunks.push(`data: ${JSON.stringify(data)}`);
    return chunks.join('\n') + '\n\n';
  }

  subscribe(req: Request, res: Response, next?: () => void) {
    try {
      const { workspaceId } = req.query as { workspaceId: string };
      const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', ['http://localhost:4200']);
      res.flushHeaders?.();

      const client: SSEClient = { id: clientId, workspaceId, res };
      this.clients.set(clientId, client);

      console.log(this.clients);

      res.write(
        this.formatMessage(null, 'connected', { clientId, workspaceId })
      ); // handshake / welcome event

      const keepAliveInterval = setInterval(() => {
        try {
          res.write(': ping\n\n');
        } catch {
          // ignore
        }
      }, 20_000); // heartbeat to keep connection alive

      req.on('close', () => {
        clearInterval(keepAliveInterval);
        this.clients.delete(clientId);
      }); // cleanup on disconnect

      if (next) next();
    } catch (err) {
      console.error('SSE subscribe error', err);
      res.status(500).end();
    }
  }

  public publish(
    workspaceId: string,
    eventName: string,
    payload: any,
    id?: string | number
  ) {
    console.log(this.clients);
    for (const [clientId, client] of this.clients) {
      if (client.workspaceId !== workspaceId) continue;
      try {
        client.res.write(
          this.formatMessage(id ?? Date.now(), eventName, payload)
        );
      } catch (err) {
        client.res.end();
        this.clients.delete(clientId);
      }
    }
  }

  countClients(workspaceId?: string) {
    if (!workspaceId) return this.clients.size;
    return Array.from(this.clients.values()).filter(
      (c) => c.workspaceId === workspaceId
    ).length;
  }
}
