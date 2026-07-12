import "next-auth";
import type { AppRole } from "@/lib/roles";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: AppRole;
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AppRole;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
  }
}
