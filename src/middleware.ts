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

  /* ---------- leer token desde cookie ---------- */
  const token = req.cookies.get("auth_token")?.value

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

    /* ---------- inyectar headers para backend ---------- */
    const requestHeaders = new Headers(req.headers)

    requestHeaders.set("x-user-id", String(payload.userId))
    requestHeaders.set(
      "x-company-id",
      payload.companyId ? String(payload.companyId) : ""
    )
    requestHeaders.set("x-role", String(payload.role))

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

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*"
  ]
}