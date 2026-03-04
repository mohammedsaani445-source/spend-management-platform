/**
 * export.ts
 * Utility functions for exporting data to various formats.
 */

/**
 * Converts an array of objects to a CSV string.
 * @param data Array of objects to export
 * @param columns Optional array of column headers (if not provided, keys of the first object are used)
 * @returns CSS string
 */
export const convertToCSV = (data: any[], columns?: { key: string, label: string }[]): string => {
    if (!data || data.length === 0) return '';

    // Determine headers
    const headers = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

    // Create CSV header row
    const headerRow = headers.map(h => `"${h.label}"`).join(',');

    // Create CSV body rows
    const rows = data.map(row => {
        return headers.map(header => {
            const val = row[header.key];
            // Handle null, undefined, dates, and objects
            let cell = val === null || val === undefined ? '' : String(val);

            // simple check for ISO dates
            if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
                cell = new Date(val).toLocaleDateString();
            }

            // Escape quotes
            cell = cell.replace(/"/g, '""');
            return `"${cell}"`;
        }).join(',');
    });

    return [headerRow, ...rows].join('\n');
};

/**
 * Triggers a browser download for a CSV file.
 * @param filename Name of the file to download
 * @param csvContent The CSV string content
 */
export const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
