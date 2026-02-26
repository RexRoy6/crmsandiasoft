import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { checkPermission } from "@/lib/auth/checkPermission"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  /* ---------- bootstrap bypass ---------- */
  if (pathname === "/api/admin/create-admin") {
    return NextResponse.next()
  }

  /* ---------- auth routes libres ---------- */
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  /* ---------- cookie OR Authorization header ---------- */
  const cookieToken = req.cookies.get("auth_token")?.value

  const authHeader = req.headers.get("authorization")
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null

  const token = cookieToken || headerToken

  if (!token) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    )
  }

  try {
    const payload = await verifyToken(token)

    /* ---------- RBAC check ---------- */
    const allowed = checkPermission(
      pathname,
      req.method,
      payload.role
    )

    if (!allowed) {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
      )
    }

    /* ---------- inyectar headers ---------- */
    const requestHeaders = new Headers(req.headers)

    requestHeaders.set("x-user-id", String(payload.userId))
    requestHeaders.set("x-role", String(payload.role))

    // ✅ SOLO enviar companyId si existe (admin puede ser null)
    if (payload.companyId !== null) {
      requestHeaders.set("x-company-id", String(payload.companyId))
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    })

  } catch {
    return NextResponse.json(
      { error: "invalid token" },
      { status: 401 }
    )
  }
}

console.log("EDGE JWT_SECRET:", process.env.JWT_SECRET)

export const config = {
  matcher: ["/api/:path*"]
}