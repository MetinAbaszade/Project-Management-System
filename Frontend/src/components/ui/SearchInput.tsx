'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  autoFocus = false
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [localValue, onChange, value]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 pr-8"
        autoFocus={autoFocus}
      />
      
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}