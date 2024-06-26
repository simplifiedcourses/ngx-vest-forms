import { Component, Input } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import {
  arrayToObject,
  vestForms,
  vestFormsViewProviders,
} from 'ngx-vest-forms';

@Component({
  selector: 'sc-phonenumbers',
  standalone: true,
  imports: [CommonModule, vestForms, KeyValuePipe],
  templateUrl: './phonenumbers.component.html',
  styleUrls: ['./phonenumbers.component.scss'],
  viewProviders: [vestFormsViewProviders],
})
export class PhonenumbersComponent {
  @Input() public values: { [key: string]: string } = {};
  public addValue = '';

  public addPhonenumber(): void {
    const phoneNumbers = [...Object.values(this.values), this.addValue];
    this.values = arrayToObject(phoneNumbers);
    this.addValue = '';
  }

  public removePhonenumber(key: string): void {
    const phonenumbers = Object.values(this.values).filter(
      (v, index) => index !== Number(key)
    );
    this.values = arrayToObject(phonenumbers);
  }
}
