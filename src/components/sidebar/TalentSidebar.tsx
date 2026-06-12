import { AppSidebar, AppSidebarSection } from "./AppSidebar";

export function TalentSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="talent-sidebar"
      onClose={onClose}
      title="Add Talent"
      titleId="talent-sidebar-title"
      closeLabel="Close talent sidebar"
      trapFocus
      closeOnOutsidePointerDown
    >
      <div className="flex flex-col gap-3">
        <AppSidebarSection heading="New sidebar">
          <p className="text-xs font-semibold leading-relaxed text-wfrp-muted-text">
            Talent controls will live here in the next step.
          </p>
        </AppSidebarSection>
      </div>
    </AppSidebar>
  );
}
