import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { OAuth2Tokens } from "arctic";
import { getSession } from "./sessions.server";
import { redirect } from "@remix-run/node";

export type User = {
  email: string;
  accessToken: string;
  refreshToken: string | null;
};

// Create an instance of the authenticator, pass a generic with what
// strategies will return
export const authenticator = new Authenticator<User>();

const getEmailFromGithub = async (
  tokens: OAuth2Tokens
): Promise<string | null> => {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });

  const data = await response.json();
  if (data && data.length > 0) {
    return data.find(
      (email: { primary: boolean; verified: boolean; email: string }) =>
        email.primary && email.verified
    )?.email;
  }

  return null;
};

authenticator.use(
  new GitHubStrategy(
    {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: process.env.GITHUB_REDIRECT_URI || "",
      scopes: ["user:email"],
    },
    async ({ tokens }) => {
      const email = await getEmailFromGithub(tokens);
      if (!email) {
        throw new Error("No email found");
      }

      // NOTE: normally you would fetch (or create) the user from the database here
      // we don't need that, so we just return the email for illustration purposes
      return {
        email: email,
        accessToken: tokens.accessToken(),
        refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
      };
    }
  ),
  "github"
);

export const isAuthenticated = async (request: Request) => {
  const session = await getSession(request.headers.get("cookie"));
  const user = session.get("user");
  return !!user;
};

export const redirectToLoginIfNotAuthenticated = async (request: Request) => {
  if (!(await isAuthenticated(request))) {
    throw redirect("/login");
  }
};
