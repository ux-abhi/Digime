import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|widget.js|api/chat|api/chatbot|api/lead|api/booking|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
