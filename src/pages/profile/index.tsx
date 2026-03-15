import { ProfileView } from "./Profile.view";
import { useProfileViewModel } from "./profile.viewmodel";

export const Profile = () => {
  const viewModel = useProfileViewModel();
  return <ProfileView {...viewModel} />;
};
