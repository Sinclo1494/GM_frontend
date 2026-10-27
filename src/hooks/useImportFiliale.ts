import { useState } from "react";
import { useAuth } from "../context/useAuth";

export interface UseImportFilialeResult {
    /** True when the user is allowed to target any filiale. */
    isAdmin: boolean;
    /** Filiale attached to the current user (null when unrestricted). */
    userFiliale: string | null;
    /** Filiale effectively targeted by the import. */
    selectedFiliale: string;
    /** Select the target filiale (superusers only). */
    setSelectedFiliale: (value: string) => void;
}

/**
 * Resolves the filiale targeted by a CSV import.
 *
 * `AuthProvider` loads the current user asynchronously, therefore `user` is
 * null during the first render of a page. Capturing the user filiale once in
 * a state initializer would keep it empty after a page reload, while the
 * displayed value (read live from the user) would show the filiale: the
 * import buttons would stay hidden.
 *
 * The effective filiale is therefore derived on every render: a superuser
 * uses the affiliate picked in the dropdown, any other user always imports
 * into their own filiale.
 */
export function useImportFiliale(): UseImportFilialeResult {

    const { user } = useAuth();

    const isAdmin = user?.is_superuser ?? false;

    const userFiliale = user?.filiale ?? null;

    // Only a superuser may target a filiale other than its own.
    const [adminFiliale, setAdminFiliale] = useState("");

    const selectedFiliale = isAdmin
        ? adminFiliale
        : (userFiliale ?? "");

    return {
        isAdmin,
        userFiliale,
        selectedFiliale,
        setSelectedFiliale: setAdminFiliale,
    };

}
