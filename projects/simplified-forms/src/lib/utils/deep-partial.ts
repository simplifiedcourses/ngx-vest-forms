/**
 * Simple type that makes every property and child property
 * partial, recursively. Why? Because template-driven forms are
 * deep partial, since they get created by the DOM
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
            ? ReadonlyArray<DeepPartial<U>>
            : T[P] extends object
                ? DeepPartial<T[P]>
                : T[P];
};