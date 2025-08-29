import { NextResponse } from "next/server"

function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  try {
    return new URL(path, base).toString()
  } catch {
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`
  }
}

export async function GET() {
  const header = process.env.FARCASTER_HEADER || ""
  const payload = process.env.FARCASTER_PAYLOAD || ""
  const signature = process.env.FARCASTER_SIGNATURE || ""

  const name = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "EchoCast"
  const icon = process.env.NEXT_PUBLIC_MINIAPP_ICON || "/icon-192x192.png"
  const description = process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "Post to Farcaster and Twitter with Base payments"
  const website = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const splash = process.env.NEXT_PUBLIC_MINIAPP_SPLASH || "/placeholder.jpg"
  const noindex = (process.env.NEXT_PUBLIC_MINIAPP_NOINDEX || "true").toLowerCase() === "true"

  const subtitle = process.env.NEXT_PUBLIC_APP_SUBTITLE
const bgcolor = process.env.NEXT_PUBLIC_APP_SUBTITLE
const category = process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY
const tagline = process.env.NEXT_PUBLIC_APP_TAGLINE
 const title = process.env.NEXT_PUBLIC_APP_OG_TITLE
  
  
  // NEXT_PUBLIC_APP_HERO_IMAGE=https://echocast-eta.vercel.app/hero.png
 
  
  // NEXT_PUBLIC_APP_OG_DESCRIPTION=EchoCast lets you write once and publish across Farcaster and Twitter instantly. Simple, seamless, social.
 
  
  
  


  const body = {
    accountAssociation: {
      header,
      payload,
      signature, subtitle, bgcolor, category, tagline, title
    },
    // Mini app metadata
    name,
    description,
    icon: absoluteUrl(icon),
    websiteUrl: website,
    splashImages: [absoluteUrl(splash)],
    noindex,
  }

  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=300" } })
}


