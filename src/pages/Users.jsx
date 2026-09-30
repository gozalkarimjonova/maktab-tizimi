import ArrayDirectory from '../components/ArrayDirectory'
import { useCollection } from '../hooks/useCollection'
import { useAdminRefresh } from '../hooks/useAdminRefresh'
export default function Users() {
 const refreshAll=useAdminRefresh()
 const {rows,loading,error,refresh}=useCollection('users')
 const reload=async()=>{await refresh();await refreshAll?.()}
 return <ArrayDirectory collection="users" rows={rows} refresh={reload} loading={loading} error={error}/>
}
