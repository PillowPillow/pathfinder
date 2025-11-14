export interface ActivityLog {
  id: number;
  characterId: number;
  userId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}

export interface CreateActivityLogDTO {
  characterId: number;
  userId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}
