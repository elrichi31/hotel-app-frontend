// components/UserData.tsx
"use client";

import { useEffect, useState } from "react";

interface UserDataProps {
  token: string;
}

interface UserData {
  name: string;
  email: string;
  // Otros campos relevantes del usuario
}

const UserData: React.FC<UserDataProps> = ({ token }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos del usuario desde la API
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }

      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecuta fetchUserData cuando el componente se monta
  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <div>
      <h2>Datos del Usuario</h2>
      {userData ? (
        <pre>
          <code>{JSON.stringify(userData, null, 2)}</code>
        </pre>
      ) : (
        <p>No se pudo cargar la información del usuario.</p>
      )}
    </div>
  );
};

export default UserData;
