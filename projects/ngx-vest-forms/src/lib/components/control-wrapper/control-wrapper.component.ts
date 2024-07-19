import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FormErrorsControlDirective } from '../../directives/form-errors-control.directive';

@Component({
  selector: '[sc-control-wrapper]',
  standalone: true,
  templateUrl: './control-wrapper.component.html',
  styleUrls: ['./control-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sc-control-wrapper--invalid]': 'invalid',
  },
})
export class ControlWrapperComponent extends FormErrorsControlDirective {}
