import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { FormDirective } from './form.directive';
import { Component, computed, signal } from '@angular/core';
import { vestForms } from '../exports';
import { DeepPartial, DeepRequired, ROOT_FORM } from 'ngx-vest-forms';
import { enforce, omitWhen, only, staticSuite, test } from 'vest';

type FormModel = DeepPartial<{
  firstName: string;
  lastName: string;
  passwords: {
    password: string;
    confirmPassword?: string;
  };
}>

const formShape: DeepRequired<FormModel> = {
  firstName: '',
  lastName: '',
  passwords: {
    password: '',
    confirmPassword: ''
  },
};

const formValidationSuite = staticSuite(
  (model: FormModel, field?: string) => {
    if (field) {
      only(field);
    }
    test(ROOT_FORM, 'Brecht his pass is not 1234', () => {
      enforce(model.firstName === 'Brecht' && model.lastName === 'Billiet' && model.passwords?.password === '1234').isFalsy();
    });

    test('firstName', 'First name is required', () => {
      enforce(model.firstName).isNotBlank();
    });
    test('lastName', 'Last name is required', () => {
      enforce(model.lastName).isNotBlank();
    });
    test('passwords.password', 'Password is not filled in', () => {
      enforce(model.passwords?.password).isNotBlank();
    });
    omitWhen(!model.passwords?.password, () => {
      test('passwords.confirmPassword', 'Confirm password is not filled in', () => {
        enforce(model.passwords?.confirmPassword).isNotBlank();
      });
    });
    omitWhen(!model.passwords?.password || !model.passwords?.confirmPassword, () => {
      test('passwords', 'Passwords do not match', () => {
        enforce(model.passwords?.confirmPassword).equals(model.passwords?.password);
      });
    });
  }
);


@Component({
  template: `
    <form vestForm
          (ngSubmit)="onSubmit()"
          [formValue]="formValue()"
          [validateRootForm]="true"
          [formShape]="shape"
          [suite]="suite"
          (validChange)="formValid.set($event)"
          (errorsChange)="errors.set($event)"
          (formValueChange)="setFormValue($event)">
      <div sc-control-wrapper>
        <label>
          <span>First name</span>
          <input placeholder="Type your first name" type="text" [ngModel]="vm.formValue.firstName" name="firstName"/>
        </label>
      </div>
      <div sc-control-wrapper>
        <label>
          <span>Last name</span>
          <input placeholder="Type your last name" type="text" [ngModel]="vm.formValue.lastName" name="lastName"/>
        </label>
      </div>
      <div sc-control-wrapper ngModelGroup="passwords">
        <div>
          <div sc-control-wrapper>
            <label>
              <span>Password</span>
              <input placeholder="Type password" type="password" [ngModel]="vm.formValue.passwords?.password" name="password"/>
            </label>
          </div>
          <div sc-control-wrapper>
            <label>
              <span>Confirm</span>
              <input placeholder="Confirm password" type="password" [ngModel]="vm.formValue.passwords?.confirmPassword"
                     name="confirmPassword"/>
            </label>
          </div>
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>
  `,
  imports: [
    FormDirective,
    vestForms
  ],
  standalone: true
})
export class FormDirectiveDemoComponent {
  protected readonly formValue = signal<FormModel>({});
  protected readonly formValid = signal<boolean>(false);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly shape = formShape;
  protected readonly suite = formValidationSuite;
  private readonly viewModel = computed(() => {
    return {
      formValue: this.formValue(),
      errors: this.errors(),
      formValid: this.formValid(),
    };
  });

  protected get vm() {
    return this.viewModel();
  }

  protected setFormValue(v: FormModel): void {
    this.formValue.set(v);
  }

  protected onSubmit(): void {
    if (this.formValid()) {
      console.log(this.formValue());
    }
  }
}

const meta: Meta<FormDirectiveDemoComponent> = {
  title: 'FormDirective',
  component: FormDirectiveDemoComponent,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<FormDirective<any>>;

export const Primary: Story = {
  decorators: [
    moduleMetadata({
      imports: [FormDirectiveDemoComponent],
    }),
    componentWrapperDecorator(FormDirectiveDemoComponent),
  ],
};
