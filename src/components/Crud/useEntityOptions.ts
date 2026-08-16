import { useEffect, useState } from "react";
import { crudOptions } from "../../api/crudService";
import type { OptionItem } from "../../types/models";

export function useEntityOptions<T extends Record<string, unknown>>(
    endpoint: string,
    valueKey: keyof T,
    labelKey: keyof T,
    params: Record<string, string> = {},
): { options: OptionItem[]; loading: boolean; error: string | null } {
    const [options, setOptions] = useState<OptionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        crudOptions<T>(endpoint, params)
            .then((items) => {
                if (cancelled) return;
                const mapped = items.map((item) => ({
                    value: String(item[valueKey]),
                    label: String(item[labelKey]),
                }));
                setOptions(mapped);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message ?? "Erreur de chargement.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [endpoint, JSON.stringify(params), valueKey, labelKey]);

    return { options, loading, error };
}
