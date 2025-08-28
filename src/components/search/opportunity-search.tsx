'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface OpportunitySearchProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  className?: string
}

export function OpportunitySearch({ 
  value, 
  onChange, 
  onSearch,
  placeholder = "Search opportunities by name, description, or strategy...",
  className = "" 
}: OpportunitySearchProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
        onSearch?.(localValue)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [localValue, value, onChange, onSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(localValue)
    onSearch?.(localValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    onSearch?.('')
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}