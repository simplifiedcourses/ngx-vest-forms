/**
 * Sometimes we want to make every property of a type
 * required, but also child properties recursively
 */
export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
}
