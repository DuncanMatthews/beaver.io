import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const session = await supabase.auth.getSession();


  // Check if the user is not signed in
  if (!session.data.session) {
    // Redirect to the sign-in page, using the request's origin for proper redirect URL
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If the user is signed in, continue with the response
  return response;
}

export const config = {
  matcher: '/',
};
