import { StatsView } from "./Stats.view";
import { useStatsViewModel } from "./stats.viewmodel";

export const Stats = () => {
  const viewModel = useStatsViewModel();
  return <StatsView {...viewModel} />;
};
