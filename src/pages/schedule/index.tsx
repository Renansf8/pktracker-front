import { ScheduleView } from "./Schedule.view";
import { useScheduleViewModel } from "./schedule.viewmodel";

export const Schedule = () => {
  const viewModel = useScheduleViewModel();
  return <ScheduleView {...viewModel} />;
};
