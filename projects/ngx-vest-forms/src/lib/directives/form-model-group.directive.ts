import { Directive, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { FormDirective } from './form.directive';
import { Observable } from 'rxjs';
import { getFormGroupField } from '../utils/form-utils';
import { ValidationOptionsDirective } from './validation-options.directive';

/**
 * Hooks into the ngModelGroup selector and triggers an asynchronous validation for a form group
 * It will use a vest suite behind the scenes
 */
@Directive({
  selector: '[ngModelGroup]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: FormModelGroupDirective,
      multi: true,
    },
  ],
})
export class FormModelGroupDirective implements AsyncValidator {
  private readonly formDirective = inject(FormDirective);
  private readonly validationOptionsDirective = inject(ValidationOptionsDirective, { self: false, optional: true });

  public validate(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    const { ngForm } = this.formDirective;
    const validationOptions = this.validationOptionsDirective?.validationOptions() || { debounceTime: 0 };
    const field = getFormGroupField(ngForm.control, control);
    return this.formDirective.createAsyncValidator(field, validationOptions)(
      control.value
    ) as Observable<ValidationErrors | null>;
  }
}
