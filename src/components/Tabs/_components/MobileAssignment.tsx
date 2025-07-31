/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Dropdown, DropdownItem } from "flowbite-react";
import { useTranslation } from "react-i18next";
import Assignment from "~/models/Assignment";
import { AssignmentType } from "~/models/AssignmentType";
import Submission from "~/models/Submission";

interface Props {
  assignment: Assignment;
  submission?: Submission;
  user: any;
  classroom: any;
  isSubmitted: boolean;
  setSelectedAssignmentId: (id: number) => void;
  setIsSubmitModalOpen: (open: boolean) => void;
  setIsConfirmAttempOpen: (open: boolean) => void;
}

export const MobileAssignment = ({
  assignment,
  submission,
  user,
  classroom,
  isSubmitted,
  setSelectedAssignmentId,
  setIsSubmitModalOpen,
  setIsConfirmAttempOpen,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="md:hidden mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-bold">{assignment.title}</h3>
        <Dropdown
          label="⋯"
          inline
          dismissOnClick
          placement="bottom-end"
          size="xs"
        >
          {assignment.fileUrl && (
            <DropdownItem as="a" href={assignment.fileUrl} target="_blank">
              {t("attached")}
            </DropdownItem>
          )}

          {assignment.type === AssignmentType.HOMEWORK &&
            classroom.creatorId !== user?.id &&
            !submission?.grade && (
              <DropdownItem
                onClick={() => {
                  setSelectedAssignmentId(assignment.id);
                  setIsSubmitModalOpen(true);
                }}
              >
                {!isSubmitted ? t("upload") : t("resubmit")}
              </DropdownItem>
            )}

          {assignment.type === AssignmentType.QUIZ &&
            classroom.creatorId !== user?.id &&
            !isSubmitted && (
              <DropdownItem
                onClick={() => {
                  setSelectedAssignmentId(assignment.id);
                  setIsConfirmAttempOpen(true);
                }}
              >
                {t("attemp")}
              </DropdownItem>
            )}
        </Dropdown>
      </div>
      <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
      <p className="text-xs text-gray-400 mt-1">
        {t("assignmentComponent.dueDate")}:{" "}
        {new Date(assignment.dueDate).toLocaleString()}
      </p>
    </Card>
  );
};
