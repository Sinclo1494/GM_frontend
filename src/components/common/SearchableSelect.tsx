import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { components } from "../../theme/components";

export interface SelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    error?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    options = [],
    placeholder = "Sélectionner...",
    className = "",
    disabled = false,
    error = false,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find((o) => o.value === value)?.label;

    const filteredOptions = search
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    const handleSelect = (opt: SelectOption) => {
        onChange(opt.value);
        setOpen(false);
        setSearch("");
    };

    const toggleOpen = () => {
        if (disabled) return;
        setOpen((prev) => {
            if (prev) setSearch("");
            return !prev;
        });
    };

    const baseClassName =
        components.select +
        (error ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "") +
        " cursor-pointer text-left flex items-center justify-between " +
        className;

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                disabled={disabled}
                onClick={toggleOpen}
                className={baseClassName}
            >
                <span className={value ? "truncate" : "text-gray-400 dark:text-dark-text-secondary"}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-b border-slate-200 dark:border-dark-border outline-none focus:border-blue-500 dark:bg-dark-input dark:text-dark-text-primary dark:placeholder:text-dark-text-secondary"
                        autoFocus
                    />
                    <div className="overflow-y-auto max-h-48">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 dark:hover:bg-dark-bg-tertiary truncate ${
                                        opt.value === value
                                            ? "bg-blue-100 dark:bg-blue-900/30 font-medium"
                                            : "text-gray-700 dark:text-dark-text-primary"
                                    }`}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                                Aucun résultat
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
