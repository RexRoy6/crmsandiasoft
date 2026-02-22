import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"

export async function middleware(req: NextRequest) {

  if(req.nextUrl.pathname.startsWith("/api/auth")){
    return NextResponse.next()
  }

  const authHeader = req.headers.get("authorization")

  if(!authHeader){
    return NextResponse.json(
      {error:"unauthorized"},
      {status:401}
    )
  }

  const token = authHeader.split(" ")[1]

  try{
    const payload = await verifyToken(token)

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id",String(payload.userId))
    requestHeaders.set("x-company-id",String(payload.companyId))
    requestHeaders.set("x-role",String(payload.role))

    return NextResponse.next({
      request:{ headers:requestHeaders }
    })

  }
catch(err){
  console.log("JWT ERROR:", err)

  return NextResponse.json(
    {error:"invalid token"},
    {status:401}
  )
}
}

export const config = {
  matcher:["/api/:path*"]
}