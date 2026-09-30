import ArrayDirectory from '../components/ArrayDirectory'
import { useCollection } from '../hooks/useCollection'
import { useAdminRefresh } from '../hooks/useAdminRefresh'
export default function Courses() {
 const refreshAll=useAdminRefresh()
 const {rows,loading,error,refresh}=useCollection('courses')
 const reload=async()=>{await refresh();await refreshAll?.()}
 return <ArrayDirectory collection="courses" rows={rows} refresh={reload} loading={loading} error={error}/>
}
