import { DeepRequired } from '@simplified/forms';

export type PhonenumberModel = Partial<{
  addValue: string;
  values: { [key: string]: string };
}>
export const phonenumberShape: DeepRequired<PhonenumberModel> = {
  addValue: '',
  values: {
    '0': ''
  }
};
