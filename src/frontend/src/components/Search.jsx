import React, { useState } from 'react';

const Search = () => {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('');
    const [format, setFormat] = useState([]);
    const [status, setStatus] = useState([]);
    const [isAdult, setIsAdult] = useState(false);
    const [averageScore, setAverageScore] = useState([0, 100]);
    const [genres, setGenres] = useState([]);
    const [sortBy, setSortBy] = useState('POPULARITY_DESC');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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
        <div className="search-page">
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
                {selectedItem ? (
                    <div className="detail-view">
                        <button onClick={() => setSelectedItem(null)} className="back-button">← Back</button>
                        <div className="detail-content">
                            <div className="media-type">{selectedItem.type} • {selectedItem.format}</div>
                            <h2>{selectedItem.title?.english || selectedItem.title?.romaji || 'Unknown'}</h2>
                            {selectedItem.coverImageUrl && <img src={selectedItem.coverImageUrl} alt={selectedItem.title?.english || selectedItem.title?.romaji} className="detail-cover-image" />}
                            <div className="detail-info">
                                {selectedItem.year && <span>Year: {selectedItem.year}</span>}
                                {selectedItem.averageScore && <span> • Score: {(selectedItem.averageScore / 10).toFixed(1)}/10</span>}
                            </div>
                            {selectedItem.description && (
                                <div className="description">
                                    <h4>Description</h4>
                                    {selectedItem.description}
                                </div>
                            )}
                            {selectedItem.episodes && <div className="episodes"><strong>Episodes:</strong> {selectedItem.episodes}</div>}
                            {selectedItem.chapters && <div className="chapters"><strong>Chapters:</strong> {selectedItem.chapters}</div>}
                            {selectedItem.volumes && <div className="volumes"><strong>Volumes:</strong> {selectedItem.volumes}</div>}
                            {selectedItem.genres && selectedItem.genres.length > 0 && (
                                <div className="genres">
                                    <h4>Genres</h4>
                                    <div className="genre-list">
                                        {selectedItem.genres.join(', ')}
                                    </div>
                                </div>
                            )}
                            {selectedItem.studios && selectedItem.studios.length > 0 && (
                                <div className="studios">
                                    <strong>Studios:</strong> {selectedItem.studios.join(', ')}
                                </div>
                            )}
                            {selectedItem.synonyms && selectedItem.synonyms.length > 0 && (
                                <div className="synonyms">
                                    <strong>Synonyms:</strong> {selectedItem.synonyms.join(', ')}
                                </div>
                            )}
                            <div className="status"><strong>Status:</strong> {selectedItem.status}</div>
                            {selectedItem.isAdult && <div className="is-adult">⚠️ Adult Content</div>}
                            {selectedItem.nextAiringEpisode && (
                                <div className="next-airing">
                                    <strong>Next Episode:</strong> {selectedItem.nextAiringEpisode.episode} ({Math.floor(selectedItem.nextAiringEpisode.timeUntilAiring / 3600)} hours)
                                </div>
                            )}
                            {selectedItem.streamingEpisodes && selectedItem.streamingEpisodes.length > 0 && (
                                <div className="streaming-episodes">
                                    <h4>Streaming on:</h4>
                                    {selectedItem.streamingEpisodes.map((episode, eIndex) => (
                                        <div key={eIndex} className="streaming-episode">
                                            <strong>{episode.site}:</strong> <a href={episode.url} target="_blank" rel="noopener noreferrer">{episode.title}</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedItem.trailer && (
                                <div className="trailer">
                                    <a href={`https://www.youtube.com/watch?v=${selectedItem.trailer.site}`} target="_blank" rel="noopener noreferrer" className="trailer-button">Watch Trailer</a>
                                </div>
                            )}
                        </div>
                    </div>
                ) : results.length > 0 ? (
                    <ul>
                        {results.map((item, index) => (
                            <li key={index} onClick={() => setSelectedItem(item)} className="result-item">
                                <div className="media-type">{item.type} • {item.format}</div>
                                <h3>{item.title?.english || item.title?.romaji || 'Unknown'}</h3>
                                {item.coverImageUrl && <img src={item.coverImageUrl} alt={item.title?.english || item.title?.romaji} className="cover-image" />}
                                <div className="media-info">
                                    {item.year && <span>Year: {item.year}</span>}
                                    {item.averageScore && <span> • Score: {(item.averageScore / 10).toFixed(1)}/10</span>}
                                </div>
                                <div className="status">{item.status}</div>
                                <div className="click-hint">Click for more details</div>
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