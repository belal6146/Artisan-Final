"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/frontend/lib/utils";

import { Input } from "@/components/ui/input";

interface FilterBarProps {
    filters: { label: string; value: string }[];
    activeFilter: string;
    onFilterChange: (value: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    className?: string;
}

export function FilterBar({ filters, activeFilter, onFilterChange, searchTerm, onSearchChange, className }: FilterBarProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row gap-4 justify-between items-center", className)}>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onFilterChange('all')}
                    className="rounded-full px-4"
                >
                    All
                </Button>
                {filters.map((filter) => (
                    <Button
                        key={filter.value}
                        variant={activeFilter === filter.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onFilterChange(filter.value)}
                        className="rounded-full px-4"
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>

            <div className="w-full sm:w-64">
                <Input
                    placeholder="Search by title or artist..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    );
}
