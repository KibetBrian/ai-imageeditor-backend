export interface UserSession {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    email: string;
    phone: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {
      avatar_url: string;
      email: string;
      email_verified: boolean;
      full_name: string;
      iss: string;
      name: string;
      phone_verified: boolean;
      picture: string;
      provider_id: string;
      sub: string;
    };
    role: string;
    aal: string;
    amr: Array<{
      method: string;
      timestamp: number;
    }>;
    session_id: string;
    is_anonymous: boolean;
  }

export interface User{
    name: string;
    email: string;
    userId: string;
  }
  