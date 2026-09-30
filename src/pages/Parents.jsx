import ArrayDirectory from '../components/ArrayDirectory'
import { useCollection } from '../hooks/useCollection'
import { useAdminRefresh } from '../hooks/useAdminRefresh'
export default function Parents() {
 const refreshAll=useAdminRefresh()
 const {rows,loading,error,refresh}=useCollection('parents')
 const reload=async()=>{await refresh();await refreshAll?.()}
 return <ArrayDirectory collection="parents" rows={rows} refresh={reload} loading={loading} error={error}/>
}
