/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Routes } from "react-router";
import { AppComposition } from "./AppComposition";

// Every route renders the SAME element instance so React preserves
// AppComposition's state when navigating between pages (it is one component
// that derives the active page from the URL). The catch-all renders the
// landing page at unknown URLs without redirecting, matching pre-router
// behavior. Do not add `key` props here — that would force remounts.
const appComposition = <AppComposition />;

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={appComposition} />
      <Route path="/:campaignId/campaign/:sessionSlug?" element={appComposition} />
      <Route path="/:campaignId/library/:bookId?/:chapterId?" element={appComposition} />
      <Route path="/:campaignId/:characterSlug/:view?" element={appComposition} />
      <Route path="*" element={appComposition} />
    </Routes>
  );
}
