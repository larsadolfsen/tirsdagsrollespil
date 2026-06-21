import { AppSidebar } from "./AppSidebar";

export function MobileMenuSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="mobile-menu-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Menu"
      titleId="mobile-menu-sidebar-title"
      closeLabel="Close menu"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <div aria-hidden="true" />
    </AppSidebar>
  );
}
