import SiteLayout from './(site)/layout'
import NotFound from './(site)/not-found'

// URLs that match no route render outside the (site) group, so wrap the
// same 404 in the site chrome.
export default function RootNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  )
}
