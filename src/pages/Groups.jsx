import ArrayDirectory from '../components/ArrayDirectory'
import { useCollection } from '../hooks/useCollection'
import { useAdminRefresh } from '../hooks/useAdminRefresh'
export default function Groups() {
 const refreshAll=useAdminRefresh()
 const {rows,loading,error,refresh}=useCollection('groups')
 const reload=async()=>{await refresh();await refreshAll?.()}
 return <ArrayDirectory collection="groups" rows={rows} refresh={reload} loading={loading} error={error}/>
}
