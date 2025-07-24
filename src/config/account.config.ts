import { AccountType } from '@/types/account.type'

export const accountConfig = Object.freeze({
  defaultAccountType: AccountType.LOCAL,
  storageKey: '__accounts',
  labelDevider: ';',
  tempIdPrefix: '__temp-',
})
