export interface User {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string; // Plain password (will be hashed)
  displayName: string;
}
