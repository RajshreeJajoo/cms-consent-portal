import { useEffect } from 'react'

export function useTitle(text) {
  useEffect(
    function () {
      document.title = text + ' · CMS'
    },
    [text]
  )
}
