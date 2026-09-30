import ArrayDirectory from '../components/ArrayDirectory'
import { useCollection } from '../hooks/useCollection'
import { useAdminRefresh } from '../hooks/useAdminRefresh'
export default function Students() {
 const refreshAll=useAdminRefresh()
 const {rows,loading,error,refresh}=useCollection('students')
 const reload=async()=>{await refresh();await refreshAll?.()}
 return <ArrayDirectory collection="students" rows={rows} refresh={reload} loading={loading} error={error}/>
}
