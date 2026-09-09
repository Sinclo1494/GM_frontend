import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { components } from "../../theme/components";
import SearchableSelect from "../common/SearchableSelect";

export type FieldType = "text" | "number" | "date" | "datetime-local" | "select" | "textarea" | "checkbox" | "readonly" | "password";

export interface FieldConfig {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
    readOnly?: boolean;
    colSpan?: number;
    section?: string;
}

interface EntityFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
    fields: FieldConfig[];
    initialValues: Record<string, unknown>;
    error: string | null;
    title: string;
    submitLabel?: string;
}

function getFieldError(
    errors: Record<string, string[]>,
    name: string,
): string | undefined {
    const err = errors[name];
    if (!err || err.length === 0) return undefined;
    return err[0];
}

const EntityFormDialog: React.FC<EntityFormDialogProps> = ({
    open,
    onClose,
    onSubmit,
    fields,
    initialValues,
    error,
    title,
    submitLabel = "Enregistrer",
}) => {
    const [values, setValues] = useState<Record<string, unknown>>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(initialValues);
            setFieldErrors({});
            setSubmitting(false);
        }
    }, [open, initialValues]);

    if (!open) return null;

    const handleChange = (name: string, value: unknown) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFieldErrors({});
        try {
            await onSubmit(values);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: unknown } };
            const data = axiosError.response?.data;
            if (data) {
                const errors: Record<string, string[]> = {};
                Object.entries(data).forEach(([key, val]) => {
                    if (Array.isArray(val)) {
                        errors[key] = val.map((v) => String(v));
                    } else if (typeof val === "string") {
                        errors[key] = [val];
                    } else {
                        errors[key] = [String(val)];
                    }
                });
                setFieldErrors(errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`${components.modal} max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 dark:text-dark-text-secondary disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 dark:border-red-800 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((field, index) => {
                            const value = values[field.name];
                            const fieldError = getFieldError(fieldErrors, field.name);
                            const prevSection = index > 0 ? fields[index - 1].section : undefined;
                            const showSectionHeader = Boolean(field.section) && field.section !== prevSection;

                            return (
                                <React.Fragment key={field.name}>
                                    {showSectionHeader && (
                                        <div className="md:col-span-2 mb-2">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-primary">
                                                {field.section}
                                            </h4>
                                            <div className="mt-1 h-px bg-gray-200 dark:border-dark-border"></div>
                                        </div>
                                    )}
                                    <div
                                        className={field.colSpan === 2 ? "md:col-span-2" : ""}
                                    >
                                    <label className={components.label}>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>

                                    {field.type === "text" || field.type === "readonly" ? (
                                        <input
                                            type="text"
                                            value={String(value ?? "")}
                                            readOnly={field.readOnly}
                                            disabled={field.readOnly || submitting}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className={components.input + (fieldError ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "")}
                                        />
                                    ) : field.type === "number" ? (
                                        <input
                                            type="number"
                                            value={String(value ?? "")}
                                            disabled={submitting}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className={components.input + (fieldError ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "")}
                                        />
                                    ) : field.type === "date" ? (
                                        <input
                                            type="date"
                                            value={String(value ?? "")}
                                            disabled={submitting}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className={components.input + (fieldError ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "")}
                                        />
                                    ) : field.type === "datetime-local" ? (
                                        <input
                                            type="datetime-local"
                                            value={String(value ?? "")}
                                            disabled={submitting}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className={components.input + (fieldError ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "")}
                                        />
                                    ) : field.type === "select" ? (
                                        <SearchableSelect
                                            value={String(value ?? "")}
                                            onChange={(val) => handleChange(field.name, val)}
                                            options={field.options ?? []}
                                            placeholder="Sélectionner..."
                                            disabled={submitting}
                                            error={!!fieldError}
                                        />
                                    ) : field.type === "textarea" ? (
                                        <textarea
                                            value={String(value ?? "")}
                                            disabled={submitting}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className={components.input + " min-h-[80px]" + (fieldError ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "")}
                                        />
                                    ) : field.type === "password" ? (
                                        <input
                                            type="password"
                                            value={String(value ?? "")}
                                            disabled={submitting}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className={components.input + (fieldError ? " border-red-300 focus:border-red-500 focus:ring-red-100" : "")}
                                        />
                                    ) : field.type === "checkbox" ? (
                                        <input
                                            type="checkbox"
                                            checked={Boolean(value)}
                                            disabled={submitting}
                                            onChange={(e) => handleChange(field.name, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-dark-border text-gray-600 focus:ring-gray-500"
                                        />
                                    ) : null}

                                    {fieldError && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldError}</p>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-dark-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className={components.button.secondary}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={components.button.primary}
                        >
                            {submitting ? "Enregistrement..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntityFormDialog;
