export class Numbers {
  static finite(value: string | number, label = 'number'): number {
    const n = typeof value === 'number' ? value : Number(value);
    if ((typeof value === 'string' && !value.trim()) || !Number.isFinite(n)) {
      throw new Error(`invalid ${label}: ${value}`);
    }
    return n;
  }

  static nonnegative(value: string | number, label: string): number {
    const n = this.finite(value, label);
    if (n < 0) throw new Error(`${label} must be nonnegative`);
    return n;
  }

  static positive(value: string | number, label: string): number {
    const n = this.finite(value, label);
    if (n <= 0) throw new Error(`${label} must be positive`);
    return n;
  }
}
