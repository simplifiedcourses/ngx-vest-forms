import { DestroyRef, Directive, inject, input, Output } from '@angular/core';
import {
    AsyncValidatorFn,
    NgForm,
    PristineChangeEvent,
    StatusChangeEvent,
    ValidationErrors,
    ValueChangeEvent
} from '@angular/forms';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    Observable,
    of,
    ReplaySubject,
    switchMap,
    take,
    tap,
    zip
} from 'rxjs';
import { StaticSuite } from 'vest';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DeepRequired } from '../utils/deep-required';
import { cloneDeep, getAllFormErrors, mergeValuesAndRawValues, set } from '../utils/form-utils';
import { validateShape } from '../utils/shape-validation';

@Directive({
    selector: 'form[simplifiedForm]',
    standalone: true,
})
export class FormDirective<T extends Record<string, any>> {
    public readonly ngForm = inject(NgForm, { self: true, optional: false });

    /**
     * The value of the form, this is needed for the validation part
     */
    public readonly formValue = input<T | null>(null);

    /**
     * Static vest suite that will be used to feed our angular validators
     */
    public readonly suite = input<StaticSuite<string, string, (model: T, field: string) => void> | null>(null);

    /**
     * The shape of our form model. This is a deep required version of the form model
     * The goal is to add default values to the shape so when the template-driven form
     * contains values that shouldn't be there (typo's) that the developer gets run-time
     * errors in dev mode
     */
    public readonly formShape = input<DeepRequired<T> | null>(null);

    /**
     * Updates the validation config which is a dynamic object that will be used to
     * trigger validations on the dependant fields
     * Eg: ```typescript
     * validationConfig = {
     *     'passwords.password': ['passwords.confirmPassword']
     * }
     * ```
     *
     * This will trigger the updateValueAndValidity on passwords.confirmPassword every time the passwords.password gets a new value
     *
     * @param v
     */
    public readonly validationConfig = input<{ [key: string]: string[] } | null>(null);
    private readonly destroyRef = inject(DestroyRef);
    private readonly statusChanges$ = this.ngForm.form.events.pipe(
        filter(v => v instanceof StatusChangeEvent),
        map(v => (v as StatusChangeEvent).status),
        distinctUntilChanged()
    );

    /**
     * Fired when the form is idle. This fixes the PENDING state issues
     * that are introduced due to the nature of asynchronous validations
     */
    public readonly idle$ = this.statusChanges$.pipe(
        filter(v => v !== 'PENDING'),
        distinctUntilChanged()
    );

    private readonly valueChanges$ = this.ngForm.form.events.pipe(
        filter(v => v instanceof ValueChangeEvent),
        map(v => (v as ValueChangeEvent<any>).value),
        map(() => mergeValuesAndRawValues<T>(this.ngForm.form))
    );

    /**
     * Triggered as soon as the form value changes
     */
    @Output() public readonly formValueChange = this.valueChanges$.pipe(
      debounceTime(0)// wait until all form elements are rendered
    );
    private readonly dirtyChanges$ = this.ngForm.form.events.pipe(
        filter(v => v instanceof PristineChangeEvent),
        map(v => !(v as PristineChangeEvent).pristine),
        distinctUntilChanged()
    );

    /**
     * Triggered as soon as the form becomes dirty
     */
    @Output() public readonly dirtyChange = this.dirtyChanges$;
    private readonly validChanges$ = this.statusChanges$.pipe(
        filter(e => e === 'VALID' || e === 'INVALID'),
        map(v => v === 'VALID'),
        switchMap((v) => this.idle$),
        map(() => this.ngForm?.form.valid),
        distinctUntilChanged(),
    );

    /**
     * Triggered When the form becomes valid but waits until the form is idle
     */
    @Output() public readonly validChange = this.validChanges$;

    /**
     * Emits an object with all the errors of the form
     */
    @Output() public readonly errorsChange = this.valueChanges$.pipe(
        switchMap(() => this.idle$),
        map(() => getAllFormErrors(this.ngForm.form))
    );

    /**
     * Used to debounce formValues to make sure vest isn't triggered all the time
     */
    private readonly formValueCache: {
        [field: string]: Partial<{
            sub$$: ReplaySubject<unknown>;
            debounced: Observable<any>;
        }>;
    } = {};

    public constructor() {
        // When the validation config changes
        // Listen to changes of the left-side of the config and trigger the updateValueAndValidity
        // function on the dependant controls or groups at the right-side of the config
        toObservable(this.validationConfig)
            .pipe(
                filter((conf) => !!conf),
                switchMap((conf) => {
                    if (!conf) {
                        return of(null);
                    }
                    const streams = Object.keys(conf).map((key) => {
                        return this.ngForm?.form.get(key)?.valueChanges.pipe(
                            // wait until the form is idle
                            switchMap(() => this.idle$),
                            map(() => this.ngForm?.form.get(key)?.value),
                            takeUntilDestroyed(this.destroyRef),
                            tap((v) => {
                                conf[key]?.forEach((path: string) => {
                                    this.ngForm?.form.get(path)?.updateValueAndValidity({
                                        onlySelf: true,
                                        emitEvent: true
                                    });
                                });
                            }),
                        );
                    });
                    return zip(streams);
                }),
            )
            .subscribe();

        /**
         * Trigger shape validations if the form gets updated
         * This is how we can throw run-time errors
         */
        this.valueChanges$.pipe(
            switchMap((v) => this.idle$.pipe(map(() => v))),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(v => {
            if (this.formShape()) {
                validateShape(v, this.formShape() as DeepRequired<T>);
            }
        });

        /**
         * Mark all the fields as touched when the form is submitted
         */
        this.ngForm.ngSubmit.subscribe(() => {
            this.ngForm.form.markAllAsTouched();
        });
    }


    /**
     * This will feed the formValueCache, debounce it till the next tick
     * and create an asynchronous validator that runs a vest suite
     * @param field
     * @param model
     * @param suite
     * @returns an asynchronous validator function
     */
    public createAsyncValidator(
        field: string
    ): AsyncValidatorFn {
        if (!this.suite()) {
            return () => of(null);
        }
        return (value: any) => {
            if (!this.formValue()) {
                return of(null);
            }
            const mod = cloneDeep(this.formValue() as T);
            set(mod as object, field, value); // Update the property with path
            if (!this.formValueCache[field]) {
                this.formValueCache[field] = {
                    sub$$: new ReplaySubject(1), // Keep track of the last model
                };
                this.formValueCache[field].debounced = this.formValueCache[field].sub$$!.pipe(debounceTime(0));
            }
            // Next the latest model in the cache for a certain field
            this.formValueCache[field].sub$$!.next(mod);

            return this.formValueCache[field].debounced!.pipe(
                // When debounced, take the latest value and perform the asynchronous vest validation
                take(1),
                switchMap(() => {
                    return new Observable((observer) => {
                        this.suite()!(mod, field).done((result) => {
                            const errors = result.getErrors()[field];
                            observer.next((errors ? { error: errors[0], errors } : null));
                            observer.complete();
                        });
                    }) as Observable<ValidationErrors | null>;
                }),
                takeUntilDestroyed(this.destroyRef),
            );
        };
    }
}
