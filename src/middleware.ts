export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/nueva-venta/:path*", "/habitaciones/:path*", "/ventas/:path*", "/usuarios/:path*", "/reservas/:path*"],
};
