import { DeepRequired , DeepPartial } from '@simplified/forms';

export type AddressModel = DeepPartial<{
  street: string;
  number: string;
  city: string;
  zipcode: string;
  country: string;
}>
export const addressShape: DeepRequired<AddressModel> = {
  street: '',
  number: '',
  city: '',
  zipcode: '',
  country: ''
}
