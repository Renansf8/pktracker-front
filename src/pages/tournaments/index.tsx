import { TournamentsView } from "./Tournaments.view";
import { useTournamentsViewModel } from "./tournaments.viewmodel";

export const Tournaments = () => {
  const viewModel = useTournamentsViewModel();
  return <TournamentsView {...viewModel} />;
};
