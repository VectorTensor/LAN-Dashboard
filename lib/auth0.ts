import { Auth0Client } from '@auth0/nextjs-auth0/server';
import {getSecret} from "@/lib/loadSecrets";

export const auth0 = new Auth0Client({
    domain: getSecret("AUTH0_DOMAIN"),
    clientId: getSecret("AUTH0_CLIENT_ID"),
    clientSecret: getSecret("AUTH0_CLIENT_SECRET"),
    secret: getSecret("AUTH0_SECRET"),
    appBaseUrl: getSecret("APP_BASE_URL"),

});
