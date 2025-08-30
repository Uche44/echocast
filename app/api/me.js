// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient, Errors } from "@farcaster/quick-auth";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// Initialize Quick Auth client
const authClient = createClient();

// Initialize Neynar API client (requires NEYNAR_API_KEY set in environment)
const neynarClient = new NeynarAPIClient(
  new Configuration({ apiKey: process.env.NEYNAR_API_KEY })
);

async function getUserProfile(fid: number) {
  try {
    const response = await neynarClient.userGet({ fid });
    // The API returns user object with fields: fid, username, display_name, pfp_url
    return {
      fid,
      username: response.username,
      displayName: response.display_name,
      avatar: response.pfp_url,
    };
  } catch (err) {
    console.error("Profile lookup error:", err);
    return { fid };
  }
}

// Next.js API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);
  const domain = req.headers.host || "";

  try {
    // Verify the Quick Auth token
    const payload = await authClient.verifyToken({ token, domain });

    const fid = Number(payload.sub);
    const profile = await getUserProfile(fid);

    // For walletAddress, assume you fetch or compute it similarly
    const walletAddress = undefined; // Implement your logic here

    res.status(200).json({
      ...profile,
      twitterConnected: false,
      walletAddress,
    });
  } catch (err) {
    if (err instanceof Errors.InvalidTokenError) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("Auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
