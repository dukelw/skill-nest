import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import CallList from "~/components/Meeting/CallList";

function MeetingSchedule() {
  return (
    <div className="p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/meeting">Meeting</BreadcrumbItem>
        <BreadcrumbItem>Schedule</BreadcrumbItem>
      </Breadcrumb>
      <CallList type="upcoming" />
    </div>
  );
}

export default MeetingSchedule;
