export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/registerclient/:path*", "/rooms/:path*", "/ventas/:path*"],
};
