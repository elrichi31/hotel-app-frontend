import { getServerSession } from "next-auth";
import { Metadata } from "next";
import { authOptions } from "@/lib/authOptions";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Página de dashboard',
}

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Debes iniciar sesión para acceder al dashboard.</p>;
  }

  return <Dashboard session={session} />;
};

export default DashboardPage;
