export function arrayToObject<T>(arr: T[]): { [key: number]: T } {
  return arr.reduce((acc, value, index) => ({ ...acc, [index]: value }), {});
}
