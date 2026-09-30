import ArrayDirectory from '../components/ArrayDirectory'
import { useCollection } from '../hooks/useCollection'
import { useAdminRefresh } from '../hooks/useAdminRefresh'
export default function Teachers() {
 const refreshAll=useAdminRefresh()
 const {rows,loading,error,refresh}=useCollection('teachers')
 const reload=async()=>{await refresh();await refreshAll?.()}
 return <ArrayDirectory collection="teachers" rows={rows} refresh={reload} loading={loading} error={error}/>
}
