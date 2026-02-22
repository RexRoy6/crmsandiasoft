import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { checkPermission } from "@/lib/auth/checkPermission"

export async function middleware(req: NextRequest) {

  const pathname = req.nextUrl.pathname

  // ⭐ bootstrap bypass
  if (pathname === "/api/admin/create-admin") {
    return NextResponse.next()
  }

  //solo para crer el admin 1

  /* auth routes libres */
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const authHeader = req.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = await verifyToken(token)

    /*  RBAC CHECK 
    es para ver que esta permisitdo segun su rol
    */
    const allowed = checkPermission(
      req.nextUrl.pathname,
      req.method,
      payload.role
    )

    if (!allowed) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* inyectar headers */
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", String(payload.userId))
    requestHeaders.set("x-company-id", String(payload.companyId))
    requestHeaders.set("x-role", String(payload.role))

    return NextResponse.next({
      request: { headers: requestHeaders }
    })

  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
}

export const config = {
  matcher: ["/api/:path*"]
}