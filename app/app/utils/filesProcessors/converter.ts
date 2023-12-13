import { IsracardProcessor } from './isracardProcessor';
import { MaxProcessor } from './maxProcessor';
import { PoalimProcessor } from './poalimProcessor';

export enum AccountTypes {
  POALIM = "poalim",
  ISRACARD = "isracard",
  MAX = "max"
}

export class AccountTypeToProcessor {
  private _account_type_to_processor = {
    [AccountTypes.POALIM]: PoalimProcessor,
    [AccountTypes.ISRACARD]: IsracardProcessor,
    [AccountTypes.MAX]: MaxProcessor
  };

  getProcessorByType(account_type: AccountTypes) {
    return this._account_type_to_processor[account_type];
  }

  getProcessors() {
    return Object.values(this._account_type_to_processor);
  }
}
