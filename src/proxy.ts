export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/((?!api/auth|api/register|entrar|cadastro|offline|manifest.webmanifest|sw.js|icon.svg|icons/|_next/static|_next/image|favicon.ico|$).*)",
  ],
};
