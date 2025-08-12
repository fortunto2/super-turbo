// User related types

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: User;
  expires: Date;
  token: string;
}

export interface UserBalance {
  userId: string;
  credits: number;
  lastUpdated: Date;
}


