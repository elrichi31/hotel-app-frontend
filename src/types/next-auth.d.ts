import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      user: any;
      email: string;
      token: {
        token: string; 
      };
    };
  }
}
