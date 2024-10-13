import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import './App.css';

const types = [
  { name: 'Water', color: '#6890F0' },
  { name: 'Fire', color: '#F08030' },
  { name: 'Grass', color: '#78C850' },
  { name: 'Electric', color: '#F8D030' },
  { name: 'Ice', color: '#98D8D8' },
  { name: 'Dragon', color: '#7038F8' },
  { name: 'Ghost', color: '#705898' },
  { name: 'Dark', color: '#705848' },
  { name: 'Psychic', color: '#F85888' },
  { name: 'Steel', color: '#B8B8D0' },
  { name: 'Fairy', color: '#EE99AC' },
  { name: 'Fighting', color: '#C03028' },
  { name: 'Flying', color: '#A890F0' },
  { name: 'Rock', color: '#B8A038' },
  { name: 'Ground', color: '#E0C068' },
  { name: 'Bug', color: '#A8B820' },
  { name: 'Poison', color: '#A040A0' }
];


const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home">
      <h1>Welcome to the Pokémon API</h1>
      
      <input
        type="text"
        placeholder="Search Pokémon Types..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="types-container">
        {filteredTypes.map((type, index) => (
          <Link to={`/type/${type.name.toLowerCase()}`} key={index} className="type-link">
            <div className="type-card" style={{ backgroundColor: type.color }}>
              <h2>{type.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};


const PokemonType = () => {
  const { typeName } = useParams();
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setSearchTerm('');  

    fetch(`https://pokeapi.co/api/v2/type/${typeName}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon');
        }
        return response.json();
      })
      .then((data) => {
        const pokemonPromises = data.pokemon.map((p) =>
          fetch(p.pokemon.url)
            .then((res) => res.json())
            .then((pokemonData) => ({
              name: pokemonData.name,
              image: pokemonData.sprites.front_default,
              id: pokemonData.id,
            }))
        );
        return Promise.all(pokemonPromises);
      })
      .then((results) => {
        setPokemonList(results);
        setFilteredPokemon(results); 
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [typeName]);

  
  useEffect(() => {
    const filtered = pokemonList.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPokemon(filtered);
  }, [searchTerm, pokemonList]);

  if (loading) return <p>Loading Pokémon...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="pokemon-type">
      <h1>{typeName.charAt(0).toUpperCase() + typeName.slice(1)} Type Pokémon</h1>

      <input
        type="text"
        placeholder="Search Pokémon..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="pokemon-grid">
        {filteredPokemon.length > 0 ? (
          filteredPokemon.map((p, index) => (
            <Link to={`/pokemon/${p.id}`} key={index} className="pokemon-link">
              <div className="pokemon-card">
                <img src={p.image} alt={p.name} className="pokemon-img" />
                <p>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No Pokémon found.</p>
        )}
      </div>
    </div>
  );
};


const PokemonDetails = () => {
  const { pokemonId } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon details');
        }
        return response.json();
      })
      .then((data) => {
        setPokemon(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pokemonId]);

  if (loading) return <p>Loading Pokémon details...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="pokemon-details">
      <div className="details-card">
        <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
        <p>Type: {pokemon.types.map((t) => t.type.name).join(', ')}</p>
        <p>Height: {pokemon.height / 10} m</p>
        <p>Weight: {pokemon.weight / 10} kg</p>
        <p>Base Stats:</p>
        <ul>
          {pokemon.stats.map((stat, index) => (
            <li key={index}>{stat.stat.name}: {stat.base_stat}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/type/:typeName" element={<PokemonType />} />
        <Route path="/pokemon/:pokemonId" element={<PokemonDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
