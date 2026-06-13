export function formatDateInput(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length > 6) {
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    }

    if (numbers.length > 4) {
        return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    }

    return numbers;
}

export function formatTimeInput(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length > 2) {
        return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }

    return numbers;
}
