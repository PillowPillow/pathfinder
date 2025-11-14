import { Server as SocketIOServer, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './events';
import { getUserFromSession } from '../auth/session';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

/**
 * Setup Socket.IO event handlers
 */
export function setupSocketHandlers(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
  io.on('connection', (socket: TypedSocket) => {
    console.log('Client connected:', socket.id);

    let authenticatedUserId: number | null = null;

    // Authentication
    socket.on('authenticate', (token: string) => {
      const userId = getUserFromSession(token);

      if (!userId) {
        socket.emit('auth:error', 'Invalid or expired session');
        return;
      }

      authenticatedUserId = userId;
      // Join user-specific room for targeted notifications
      socket.join(`user:${userId}`);

      socket.emit('authenticated', userId);
      console.log(`User ${userId} authenticated via socket`);
    });

    // Campaign room management
    socket.on('campaign:join', (campaignId: number) => {
      if (!authenticatedUserId) {
        socket.emit('auth:error', 'Not authenticated');
        return;
      }

      socket.join(`campaign:${campaignId}`);
      socket.emit('campaign:joined', campaignId);
      console.log(`User ${authenticatedUserId} joined campaign ${campaignId}`);
    });

    socket.on('campaign:leave', (campaignId: number) => {
      socket.leave(`campaign:${campaignId}`);
      console.log(`User ${authenticatedUserId} left campaign ${campaignId}`);
    });

    // Character update handling
    socket.on('character:update', (data) => {
      if (!authenticatedUserId) {
        socket.emit('auth:error', 'Not authenticated');
        return;
      }

      // Broadcast to all users in the campaign (except sender)
      // Note: In full implementation, we'd get campaign ID from character
      // and validate permissions here
      socket.broadcast.emit('character:updated', {
        ...data,
        userId: authenticatedUserId,
        timestamp: Date.now(),
      });

      console.log(`Character ${data.characterId} updated by user ${authenticatedUserId}`);
    });

    // State synchronization
    socket.on('sync:request', (campaignId: number) => {
      if (!authenticatedUserId) {
        socket.emit('auth:error', 'Not authenticated');
        return;
      }

      // In full implementation, fetch actual campaign state from database
      socket.emit('sync:campaign-state', {
        campaignId,
        characters: [], // Would be populated from database
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket.IO handlers configured');
}
