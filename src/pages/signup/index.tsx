import { SignUpView } from "./SignUp.view";
import { useSignUpViewModel } from "./signup.viewmodel";

export function SignUp() {
  const viewModel = useSignUpViewModel();
  return <SignUpView {...viewModel} />;
}
