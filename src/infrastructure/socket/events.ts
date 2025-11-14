/**
 * Socket.IO Event Type Definitions
 * Ensures type-safe communication between client and server
 */

// Client -> Server Events
export interface ClientToServerEvents {
  authenticate: (token: string) => void;
  'campaign:join': (campaignId: number) => void;
  'campaign:leave': (campaignId: number) => void;
  'character:update': (data: CharacterUpdateEvent) => void;
  'sync:request': (campaignId: number) => void;
}

// Server -> Client Events
export interface ServerToClientEvents {
  authenticated: (userId: number) => void;
  'auth:error': (message: string) => void;
  'campaign:joined': (campaignId: number) => void;
  'character:updated': (data: CharacterUpdatedEvent) => void;
  'character:conflict': (data: ConflictEvent) => void;
  'sync:campaign-state': (data: CampaignStateEvent) => void;
  notification: (data: NotificationEvent) => void;
}

// Event Data Types
export interface CharacterUpdateEvent {
  characterId: number;
  updates: Record<string, any>;
  timestamp: number;
}

export interface CharacterUpdatedEvent {
  characterId: number;
  updates: Record<string, any>;
  userId: number;
  timestamp: number;
}

export interface ConflictEvent {
  characterId: number;
  field: string;
  serverValue: any;
  clientValue: any;
}

export interface CampaignStateEvent {
  campaignId: number;
  characters: Array<{
    id: number;
    playerId: number;
    name: string;
    updatedAt: string;
  }>;
}

export interface NotificationEvent {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}
