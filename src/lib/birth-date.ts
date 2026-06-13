const exactBirthDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function hasExactBirthDate(value: string): boolean {
    const match = exactBirthDatePattern.exec(value);
    if (!match) return false;

    const yearText = match[1];
    const monthText = match[2];
    const dayText = match[3];
    if (!yearText || !monthText || !dayText) return false;

    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}
