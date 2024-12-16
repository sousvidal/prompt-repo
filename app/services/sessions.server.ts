import { createCookieSessionStorage } from "@remix-run/node";
import { User } from "./auth.server";

type SessionData = {
  user: User;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.COOKIE_SECRET || ""],
        secure: true,
      },
    }
  );

export { getSession, commitSession, destroySession };
