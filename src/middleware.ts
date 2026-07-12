import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/api/auth"];
const apiRoutes = ["/api"];
const superAdminRole = "SUPER_ADMIN";
const routeRoles: Record<string, string[]> = {
  "/dashboard": ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/vehicles": ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  "/drivers": ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/trips": ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/maintenance": ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/fuel-expenses": ["FLEET_MANAGER", "DRIVER", "FINANCIAL_ANALYST"],
  "/reports": ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/documents": ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  "/super-admin": [superAdminRole],
};

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = !!token;
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    publicRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isApiRoute = apiRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    if (isLoggedIn && nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    );
  }

  if (isApiRoute) {
    return NextResponse.next();
  }

  const matchedRoute = Object.keys(routeRoles)
    .sort((a, b) => b.length - a.length)
    .find((route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));

  if (matchedRoute) {
    const role = typeof token.role === "string" ? token.role : "";
    const canAccess = role === superAdminRole || routeRoles[matchedRoute].includes(role);

    if (!canAccess) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
