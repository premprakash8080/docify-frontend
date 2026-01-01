import withReducer from '../../store/withReducer';
import CalendarApp from '../apps/calendar/CalendarApp';
import calendarReducer from '../apps/calendar/store';

// Use the existing CalendarApp component with its reducer
function CalendarPage() {
  return <CalendarApp />;
}

export default withReducer('calendarApp', calendarReducer)(CalendarPage);
