import { clerkMiddleware } from "@clerk/nextjs/server";

// Interceptează fiecare request și atașează sesiunea Clerk.
// Deocamdată nu blochează nimic — doar face auth() disponibil peste tot.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Sare peste fișierele statice și internele Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Dar rulează mereu pe rutele API
    "/(api|trpc)(.*)",
  ],
};