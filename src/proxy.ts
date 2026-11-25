import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// The proxy only attaches the Clerk session and sends signed-in users from the
// landing page to the dashboard. Access control lives in the protected layouts
// themselves (see src/app/dashboard/layout.tsx), as Clerk recommends.
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname === "/") {
    const { userId } = await auth();
    if (userId) return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
