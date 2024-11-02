// components/PokemonPage.tsx
"use client";
import React, { useEffect, useState } from "react";

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonPageProps {
  session: any;
}

const PokemonPage: React.FC<PokemonPageProps> = ({ session }) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPokemons = async () => {
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=5");
      const data = await res.json();
      setPokemons(data.results);
    } catch (error) {
      console.error("Error al obtener los datos de los Pokémon:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPokemons();
    }
  }, [session]);

  if (!session) {
    return <p>Debes iniciar sesión para ver esta página</p>;
  }

  if (loading) {
    return <p>Cargando datos de Pokémon...</p>;
  }

  return (
    <div>
      <h1>Lista de los primeros 5 Pokémon</h1>
      <ul>
        {pokemons.map((pokemon, index) => (
          <li key={index}>
            <p>Nombre: {pokemon.name}</p>
            <p>URL: {pokemon.url}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonPage;
