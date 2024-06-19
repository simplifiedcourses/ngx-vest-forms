import { Component, Input, ViewEncapsulation } from '@angular/core';

import { AddressModel } from '../../models/address.model';
import { vestForms, vestFormsViewProviders } from 'ngx-vest-forms';

@Component({
  selector: 'address',
  standalone: true,
  imports: [vestForms],
  viewProviders: [vestFormsViewProviders],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
})
export class AddressComponent {
  @Input() address?: AddressModel;
}
