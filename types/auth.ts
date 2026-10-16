export interface User {
  id: string;
  name: string;
  email: string;
  business_id?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
}

/* =========================================================
   REGISTER
========================================================= */

export interface RegisterRequest {
  business_name: string;
  owner_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: User;
  business: Business;
}

/* =========================================================
   LOGIN
========================================================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: User;
}

/* =========================================================
   REFRESH
========================================================= */

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
}

/* =========================================================
   ME
========================================================= */

export interface MeResponse {
  user: User;
}