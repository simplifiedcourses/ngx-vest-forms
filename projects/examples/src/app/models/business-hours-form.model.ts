import { DeepPartial, DeepRequired } from 'ngx-vest-forms';

export type BusinessHoursFormModel = DeepPartial<{
  businessHours: {
    addValue: BusinessHourFormModel;
    values: { [key: string]: BusinessHourFormModel };
  };
}>;

export type BusinessHourFormModel = DeepPartial<{
  from: string;
  to: string;
}>;

export const businesssHourFormShape: DeepRequired<BusinessHourFormModel> = {
  from: '00:00',
  to: '00:00',
};

export const businessHoursFormShape: DeepRequired<BusinessHoursFormModel> = {
  businessHours: {
    addValue: { ...businesssHourFormShape },
    values: {
      '0': { ...businesssHourFormShape },
    },
  },
};
