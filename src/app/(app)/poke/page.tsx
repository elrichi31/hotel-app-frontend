// app/pokemon/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PokemonPage from "@/components/PokemonPage";

const Page = async () => {
  const session = await getServerSession(authOptions);

  return <PokemonPage session={session} />;
};

export default Page;
