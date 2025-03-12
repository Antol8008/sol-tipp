'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');
  const debouncedValue = useDebounce(value, 300);

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams();
      // Copy over existing params
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
      
      if (term) {
        params.set('q', term);
      } else {
        params.delete('q');
      }
      router.push(`/explore?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    handleSearch(debouncedValue);
  }, [debouncedValue, handleSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search creators..."
        className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E64D] focus:border-transparent font-jakarta"
      />
    </div>
  );
} 