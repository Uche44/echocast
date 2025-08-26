import crypto from "crypto";

function toBase64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function GET(request: Request) {
  try {
    const reqUrl = new URL(request.url);

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/twitter/callback`;

    // Generate PKCE code_verifier and code_challenge
    const codeVerifier = toBase64Url(crypto.randomBytes(32));
    const codeChallenge = toBase64Url(
      crypto.createHash("sha256").update(codeVerifier).digest()
    );

    // Store the verifier in an HttpOnly cookie
    const cookie = `twitter_code_verifier=${codeVerifier}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${reqUrl.protocol === "https:" ? "; Secure" : ""}`;

    // Build OAuth 2.0 authorize URL
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.TWITTER_CLIENT_ID || "");
    authUrl.searchParams.set("redirect_uri", callbackUrl);
    authUrl.searchParams.set("scope", "tweet.read tweet.write users.read offline.access");
    authUrl.searchParams.set("state", crypto.randomBytes(16).toString("hex"));
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl.toString(),
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("Twitter OAuth2 start error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start OAuth flow" }),
      { status: 500 }
    );
  }
}

