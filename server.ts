import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { runMigrations } from './src/infrastructure/database/sqlite';
import { setupSocketHandlers } from './src/infrastructure/socket/server';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  // Run database migrations
  console.log('Running database migrations...');
  runMigrations();
  console.log('Migrations complete');

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      methods: ['GET', 'POST'],
    },
  });

  // Setup Socket.IO event handlers
  setupSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Socket.IO server running`);
  });
});
