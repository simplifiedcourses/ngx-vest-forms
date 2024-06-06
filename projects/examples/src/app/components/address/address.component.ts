import { Component, Input, ViewEncapsulation } from '@angular/core';

import { AddressModel } from '../../models/address.model';
import { simplifiedForms, simplifiedFormsViewProviders } from '@simplified/forms';

@Component({
  selector: 'address',
  standalone: true,
  imports: [simplifiedForms],
  viewProviders: [simplifiedFormsViewProviders],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent {
  @Input() address?: AddressModel;
}
