// src/utils/readCsvPreview.ts

export async function readCsvPreview(file: File) {
    const text = await file.text();

    const rows = text
        .split(/\r?\n/)
        .filter(Boolean)
        .map((r) => r.split(","));

    const columnCount = Math.max(...rows.map((r) => r.length));

    return Array.from({ length: columnCount }, (_, index) => ({
        index,
        samples: rows
            .slice(0, 5)
            .map((r) => r[index] ?? ""),
    }));
}