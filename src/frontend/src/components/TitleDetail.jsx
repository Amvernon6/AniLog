import React from 'react';
import '../css/title-detail.css';

const TitleDetail = ({ 
    selectedItem, 
    onBack, 
    inProgressItems, 
    addedItems, 
    onAddToList, 
    onRemoveFromList, 
    onAddToInProgress 
}) => {
    if (!selectedItem) return null;

    return (
        <div className="detail-view" data-testid="detail-view">
            <button onClick={onBack} className="back-button" data-testid="back-button">← Back</button>
            <div className="detail-content">
                <div className="media-type" data-testid="media-type">{selectedItem.type} {selectedItem.format != null && selectedItem.format !== selectedItem.type && `• ${selectedItem.format}`}</div>
                <h2>{selectedItem.title?.english || selectedItem.title?.romaji || selectedItem.title?.nativeTitle || 'Error Getting Title'}</h2>
                {selectedItem.coverImageUrl && <img src={selectedItem.coverImageUrl} alt={selectedItem.title?.english || selectedItem.title?.romaji} className="detail-cover-image" />}
                {!inProgressItems.has(selectedItem.id) ? (
                    addedItems.has(selectedItem.id) ? (
                        <button onClick={() => onRemoveFromList(selectedItem)} className="add-to-list-button added">
                            ✓ Added to List
                        </button>
                    ) : (
                        <button onClick={() => onAddToList(selectedItem)} className="add-to-list-button">
                            + Add to List
                        </button>
                    )
                ) : null}
                {inProgressItems.has(selectedItem.id) ? (
                    <button onClick={() => {}} className="in-progress-button added">
                        ✓ In Progress
                    </button>
                ) : (
                    <button onClick={() => onAddToInProgress(selectedItem)} className="in-progress-button">
                        + Mark as In Progress
                    </button>
                )}
                <div className="detail-info" data-testid="detail-info">
                    {selectedItem.year && <span> {selectedItem.status == "NOT_YET_RELEASED" ? "Release Date: " + (selectedItem.month ? selectedItem.day ? `${selectedItem.month}/${selectedItem.day}/${selectedItem.year}` : `${selectedItem.month}/${selectedItem.year}` : selectedItem.year) : "Year: " + selectedItem.year}</span>}
                    {selectedItem.averageScore && <span> IMDB Score: {(selectedItem.averageScore / 10).toFixed(1)}/10</span>}
                </div>
                {selectedItem.description && (
                    <div className="description">
                        <h4>Description</h4>
                        <div dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                    </div>
                )}
                {selectedItem.episodes && <div data-testid="episodes"><strong>Episodes:</strong> {selectedItem.episodes}</div>}
                {selectedItem.chapters && <div data-testid="chapters"><strong>Chapters:</strong> {selectedItem.chapters}</div>}
                {selectedItem.volumes && <div data-testid="volumes"><strong>Volumes:</strong> {selectedItem.volumes}</div>}
                {selectedItem.genres && selectedItem.genres.length > 0 && (
                    <div className="genres">
                        <div className="genre-list">
                            <strong>Genres:</strong> {selectedItem.genres.join(', ')}
                        </div>
                    </div>
                )}
                {selectedItem.studios && selectedItem.studios.length > 0 && (
                    <div className="studios">
                        <strong>Studios:</strong> {selectedItem.studios.join(', ')}
                    </div>
                )}
                {selectedItem.synonyms && selectedItem.synonyms.length > 0 && (
                    <div className="synonyms" data-testid="synonyms">
                        <strong>Other Names:</strong> {selectedItem.synonyms.join(', ')}
                    </div>
                )}
                <div className={`status status-${selectedItem.status.toLowerCase()}`} data-testid="status"><strong>Status:</strong> {selectedItem.status.replace(/_/g, ' ')}</div>
                {selectedItem.isAdult && <div className="is-adult" data-testid="adult-warning">⚠️ Adult Content</div>}
                {selectedItem.nextAiringEpisode && (
                    <div className="next-airing">
                        <strong>Next Episode:</strong> Episode {selectedItem.nextAiringEpisode.episode} releases on {new Date(Date.now() + selectedItem.nextAiringEpisode.timeUntilAiring * 1000).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TitleDetail;
