import { useOutletContext } from 'react-router-dom'

export function useAdminRefresh() {
  return useOutletContext()?.refresh
}
