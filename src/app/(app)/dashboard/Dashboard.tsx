// components/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";

interface DashboardProps {
  session: any;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Función para obtener los datos del usuario desde la API
  const getUser = async () => {
    if (!session) return;
    setLoadingUser(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token.token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }

      const data = await res.json();
      setUserData(data);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  // Ejecuta getUser al cargar el componente si hay sesión
  useEffect(() => {
    if (session) {
      getUser();
    }
  }, [session]);

  // Muestra el mensaje de carga mientras espera la sesión o los datos de usuario
  if (loadingUser) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>
      <div>
        {userData ? (
          <pre>
            <code>{JSON.stringify(userData, null, 2)}</code>
          </pre>
        ) : (
          <p>No se ha cargado el usuario.</p>
        )}
      </div>
      <button onClick={getUser}>Get user</button>
    </div>
  );
};

export default Dashboard;
