"use client";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }
  const getUser = async () => {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user?.token.token}`,
      },
    })
    const data = await res.json();
    console.log(data);
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>
        <code>{JSON.stringify(session, null, 2)}</code>
        <button onClick={getUser}>Get user</button>
      </pre>
    </div>
  );
};
export default Dashboard;
