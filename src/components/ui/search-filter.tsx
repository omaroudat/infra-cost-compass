
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default SearchFilter;
