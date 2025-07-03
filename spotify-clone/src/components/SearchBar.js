import React, { useState, useRef, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import SearchService from '../services/searchService';

const SearchBar = ({ onSearchResults, onFocus, onBlur, isFocused, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Fetch search results when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length >= 2) {
        setIsLoading(true);
        try {
          const results = await SearchService.searchAll(debouncedQuery);
          onSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          onSearchResults({ songs: [], artists: [], playlists: [], total: 0 });
        } finally {
          setIsLoading(false);
        }
      } else if (debouncedQuery.length === 0) {
        onSearchResults({ songs: [], artists: [], playlists: [], total: 0 });
      }
    };

    performSearch();
  }, [debouncedQuery, onSearchResults]);

  // Fetch suggestions for autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 1 && showSuggestions) {
        try {
          const suggestionList = await SearchService.getSearchSuggestions(query);
          setSuggestions(suggestionList);
        } catch (error) {
          console.error('Suggestions error:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [query, showSuggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestion(-1);
    
    if (value.length >= 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(query.length >= 1);
    onFocus && onFocus();
  };

  // Handle input blur (with delay to allow click on suggestions)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      onBlur && onBlur();
    }, 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestion]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearchResults({ songs: [], artists: [], playlists: [], total: 0 });
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-full sm:max-w-md">
      {/* Search Input */}
      <div className={`
        relative flex items-center
        bg-spotify-light-gray rounded-full transition-all duration-200
        ${isFocused ? 'ring-2 ring-white' : 'hover:bg-spotify-lighter'}
      `}>
        {/* Search Icon */}
        <div className="absolute left-4 text-spotify-text-secondary">
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-spotify-green border-t-transparent rounded-full"></div>
          ) : (
            <span className="text-lg">🔍</span>
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Bạn muốn nghe gì?"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="
            w-full bg-transparent text-white placeholder-spotify-text-secondary
            pl-12 pr-12 py-2 sm:py-3 text-sm
            focus:outline-none
          "
          autoComplete="off"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="
              absolute right-4 text-spotify-text-secondary hover:text-white
              transition-colors duration-200
            "
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-spotify-light-gray rounded-lg shadow-spotify-lg
            border border-spotify-lighter-gray
            max-h-64 overflow-y-auto
          "
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full text-left px-4 py-3 text-sm
                transition-colors duration-200
                flex items-center space-x-3
                ${index === selectedSuggestion 
                  ? 'bg-spotify-lighter text-white' 
                  : 'text-spotify-text-secondary hover:text-white hover:bg-spotify-lighter'
                }
              `}
            >
              <span className="text-spotify-text-secondary">🔍</span>
              <span className="flex-1 line-clamp-1">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 