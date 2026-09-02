import { useEffect } from 'react'

/** Set the document title and meta description for a page. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', description)
    }
  }, [title, description])
}
