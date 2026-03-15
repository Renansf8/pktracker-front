import { BankView } from "./Bank.view";
import { useBankViewModel } from "./bank.viewmodel";

export const Bank = () => {
  const viewModel = useBankViewModel();
  return <BankView {...viewModel} />;
};
