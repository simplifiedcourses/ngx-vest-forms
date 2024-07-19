import {
  AfterViewInit,
  ChangeDetectorRef,
  ContentChild,
  Directive,
  inject,
  OnDestroy,
} from '@angular/core';
import { NgModel, NgModelGroup, AbstractControl } from '@angular/forms';
import { Subject, switchMap, of, mergeWith, takeUntil } from 'rxjs';
import { FormDirective } from './form.directive';

/**
 * Base class for all directives that are used to control the form errors.
 *
 * This class is responsible for marking the component and its ancestors as dirty
 * when the form is idle.
 * Can be used to easily create custom form fields that display errors.
 *
 * @example
 * ```ts
 * export class MyWCustomFormFieldComponent extends FormErrorsControlDirective {}
 * ```
 *
 * ```html
 * <my-custom-form-field>
 *  <ng-content />
 *
 *  @if(invalid){
 *    <ul class="error">
 *    @for (error of errors; track error) {
        <li>{{ error }}</li>
 *    </ul>
 *  }
 * </my-custom-form-field>
 * ```
 */
@Directive()
export abstract class FormErrorsControlDirective
  implements AfterViewInit, OnDestroy
{
  @ContentChild(NgModel) public ngModel?: NgModel; // Optional ngModel
  public readonly ngModelGroup: NgModelGroup | null = inject(NgModelGroup, {
    optional: true,
    self: true,
  });
  private readonly destroy$$ = new Subject<void>();
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly formDirective = inject(FormDirective);
  // Cache the previous error to avoid 'flickering'
  private previousError?: string[];

  public get invalid() {
    return this.control?.touched && this.errors;
  }

  public get errors(): string[] | undefined {
    if (this.control?.pending) {
      return this.previousError;
    } else {
      this.previousError = this.control?.errors?.['errors'];
    }
    return this.control?.errors?.['errors'];
  }

  private get control(): AbstractControl | undefined {
    return this.ngModelGroup
      ? this.ngModelGroup.control
      : this.ngModel?.control;
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
  }

  public ngAfterViewInit(): void {
    // Wait until the form is idle
    // Then, listen to all events of the ngModelGroup or ngModel
    // and mark the component and its ancestors as dirty
    // This allows us to use the OnPush ChangeDetection Strategy
    this.formDirective.idle$
      .pipe(
        switchMap(() => this.ngModelGroup?.control?.events || of(null)),
        mergeWith(this.control?.events || of(null)),
        takeUntil(this.destroy$$)
      )
      .subscribe(() => {
        this.cdRef.markForCheck();
      });
  }
}
