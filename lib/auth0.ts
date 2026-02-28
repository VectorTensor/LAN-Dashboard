import { Auth0Client } from '@auth0/nextjs-auth0/server';
import dotenv from "dotenv";

// Load env file once at build/runtime
dotenv.config({ path: "/vault/secrets/config" });
export const auth0 = new Auth0Client();
