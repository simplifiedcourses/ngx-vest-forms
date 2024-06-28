import { Directive, input } from '@angular/core';

/**
 * Define validation options for a form, form model group or form model
 */
@Directive({
  selector: '[validationOptions]',
  standalone: true,
})
export class ValidationOptionsDirective {

  public readonly validationOptions = input.required<ValidationOptions>();

}

/**
 * Validation Options
 */
export interface ValidationOptions {

  /**
   * debounceTime for the next validation
   */
  debounceTime: number;
}
