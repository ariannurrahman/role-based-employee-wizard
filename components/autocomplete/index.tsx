import { useEffect, useRef, useState } from 'react';
import styles from './Autocomplete.module.css';

interface Option {
  id: number | string;
  name: string;
}

interface AutocompleteProps {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  fetchOptions: (query: string) => Promise<Option[]>;
  onSelect: (value: string) => void;
}

export const Autocomplete = ({ label, value = '', placeholder, fetchOptions, onSelect, id }: AutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<string | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query) {
      setOptions([]);
      setIsOpen(false);
      selectedOptionRef.current = null;
      return;
    }

    // If query matches a previously selected option, don't fetch again
    if (selectedOptionRef.current === query) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(false);

        const result = await fetchOptions(query);

        // Client-side filtering as fallback if API doesn't filter properly
        // Filter results that contain the query (case-insensitive)
        const filteredResults = result.filter((opt) => opt.name.toLowerCase().includes(query.toLowerCase()));

        setOptions(filteredResults);

        // Only auto-open if query doesn't exactly match any option
        // This prevents reopening after selection
        const exactMatch = filteredResults.find((opt) => opt.name === query);
        if (!exactMatch && filteredResults.length > 0) {
          setIsOpen(true);
        }
      } catch {
        setOptions([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(option: Option) {
    onSelect(option.name);
    selectedOptionRef.current = option.name;
    setQuery(option.name);
    setIsOpen(false);
  }

  return (
    <div className={styles['autocomplete']} ref={wrapperRef}>
      <label className={styles['autocomplete__label']} htmlFor={id}>
        {label}
      </label>

      <input
        className={styles['autocomplete__input']}
        id={id}
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          selectedOptionRef.current = null; // Clear selection when user types
          setQuery(e.target.value);
        }}
        onFocus={() => {
          // Only open if there are options to show and not a selected value
          if (query && options.length > 0 && selectedOptionRef.current !== query) {
            setIsOpen(true);
          }
        }}
      />

      {isOpen && (
        <div className={styles['autocomplete__dropdown']}>
          {loading && <div className={styles['autocomplete__status']}>Loading…</div>}

          {error && (
            <div className={`${styles['autocomplete__status']} ${styles['autocomplete__status--error']}`}>
              Mock API not connected
            </div>
          )}

          {!loading && !error && options.length === 0 && (
            <div className={styles['autocomplete__status']}>No results</div>
          )}

          {!loading &&
            !error &&
            options.map((option) => (
              <button
                key={option.id}
                type='button'
                className={styles['autocomplete__option']}
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
