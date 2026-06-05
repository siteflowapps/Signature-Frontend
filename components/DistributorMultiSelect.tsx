import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../network/apiService';
import { Distributor } from '../types';

interface DistributorMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export const DistributorMultiSelect: React.FC<DistributorMultiSelectProps> = ({
  selectedIds,
  onChange,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Distributor[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial selected distributors if there are selectedIds but we don't have the objects
  // (In a real scenario, you might have an endpoint to fetch by IDs, but for now we'll just populate from search results if available)
  // Or handle it simply by tracking selections made in this session.
  
  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setOptions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await apiService.distributors.search(searchTerm);
        if (response.success) {
          setOptions(response.data.content);
        } else {
          setOptions([]);
        }
      } catch {
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelect = (distributor: Distributor) => {
    if (!selectedIds.includes(distributor.id)) {
      const newSelectedIds = [...selectedIds, distributor.id];
      onChange(newSelectedIds);
      
      // Keep track of the full object for rendering tags
      setSelectedDistributors(prev => [...prev, distributor]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemove = (idToRemove: string) => {
    if (disabled) return;
    const newSelectedIds = selectedIds.filter(id => id !== idToRemove);
    onChange(newSelectedIds);
    setSelectedDistributors(prev => prev.filter(d => d.id !== idToRemove));
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Distributor(s) *
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Search and select distributors..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
        </div>
      </div>

      {/* Selected Tags */}
      {selectedDistributors.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedDistributors.map((dist) => (
            <span 
              key={dist.id} 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {dist.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(dist.id)}
                  className="p-0.5 hover:bg-indigo-200 rounded-md transition-colors text-indigo-500 hover:text-indigo-800 focus:outline-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto top-[70px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500 font-medium">Searching...</div>
          ) : options.length > 0 ? (
            <ul className="py-1">
              {options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <li 
                    key={option.id}
                    onClick={() => !isSelected && handleSelect(option)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{option.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {[option.phone, option.address || option.gstNumber].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500 font-medium">No distributors found.</div>
          )}
        </div>
      )}
    </div>
  );
};
