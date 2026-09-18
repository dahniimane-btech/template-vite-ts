// Utilitaires de dates (format ISO yyyy-mm-dd, en heure locale).

export function todayISO(): string {
    return toISODate(new Date());
}

export function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function addDays(isoDate: string, days: number): string {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, (m - 1), d);
    date.setDate(date.getDate() + days);
    return toISODate(date);
}

export function daysBetween(fromISO: string, toISOStr: string): number {
    const [y1, m1, d1] = fromISO.split('-').map(Number);
    const [y2, m2, d2] = toISOStr.split('-').map(Number);
    const a = new Date(y1, m1 - 1, d1).getTime();
    const b = new Date(y2, m2 - 1, d2).getTime();
    return Math.round((b - a) / 86400000);
}
