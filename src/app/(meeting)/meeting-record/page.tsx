import { Breadcrumb, BreadcrumbItem } from "~/components/ui/primitives";
import CallList from "~/components/Meeting/CallList";

function MeetingRecord() {
  return (
    <div className="p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/meeting">Meeting</BreadcrumbItem>
        <BreadcrumbItem>Record</BreadcrumbItem>
      </Breadcrumb>
      <CallList type="recordings" />
    </div>
  );
}

export default MeetingRecord;
