import { HomeView } from "./Home.view";
import { useHomeViewModel } from "./home.viewmodel";

export const Home = () => {
  const viewModel = useHomeViewModel();

  return <HomeView {...viewModel} />;
};
