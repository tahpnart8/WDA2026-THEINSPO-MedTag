export type Role = 'GUARDIAN' | 'DOCTOR' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    phoneNumber?: string;
    avatarUrl?: string;
}

export interface AuthResponse {
    success: boolean;
    user: User;
    token: string;
}
