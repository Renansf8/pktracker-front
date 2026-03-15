import { SignInView } from "./SignIn.view";
import { useSignInViewModel } from "./signin.viewmodel";

export function SignIn() {
  const viewModel = useSignInViewModel();
  return <SignInView {...viewModel} />;
}
