export interface ValidationIssue {
    line: number | null;
    field: string | null;
    value: unknown;
    message: string;
    severity: "error" | "warning";
}

export interface ValidationSummaryData {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    errors: number;
    warnings: number;
}

export interface ValidationResult {
    success: boolean;
    validation_id?: string;
    summary: ValidationSummaryData;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
}

export interface ImportResult {
    success: boolean;
    imported_rows: number;
    filiale?: string;
    message?: string;
    validation_summary?: ValidationSummaryData;
}

export interface PreviewColumn {
    index: number;
    samples: string[];
}