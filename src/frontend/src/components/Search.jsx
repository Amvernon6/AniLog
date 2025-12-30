import React, { useState } from 'react';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            
            // console.log('Response Limit:', "Used " + response.headers.get("x-ratelimit-remaining") + " of " + response.headers.get('x-ratelimit-limit'));

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anime or manga..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>
            <div className="search-results">
                {results.length > 0 ? (
                    <ul>
                        {results.map((item, index) => (
                            <li key={index}>
                                <div className="media-type">{item.type} • {item.format}</div>
                                <h3>{item.title?.english || item.title?.romaji || 'Unknown'}</h3>
                                <div className="media-info">
                                    {item.year && <span>Year: {item.year}</span>}
                                    {item.averageScore && <span> • Score: {item.averageScore}%</span>}
                                </div>
                                {item.genres && item.genres.length > 0 && (
                                    <div className="genres">
                                        {item.genres.join(', ')}
                                    </div>
                                )}
                                {item.studios && item.studios.length > 0 && (
                                    <div className="studios">
                                        Studio: {item.studios.join(', ')}
                                    </div>
                                )}
                                <div className="status">{item.status}</div>
                            </li>
                        ))}
                    </ul>
                ) : query && !loading ? (
                    <p className="no-results">No results found.</p>
                ) : null}
            </div>
        </div>
    );
};

export default Search;