// src/types/csvMapping.ts

export interface CsvPreview {
    columns: {
        index: number;
        samples: string[];
    }[];
}

export interface Mapping {
    [columnIndex: number]: string;
}

