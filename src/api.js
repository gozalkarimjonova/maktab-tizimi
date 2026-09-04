const API_URL = '/api'

async function request(path, options = {}) {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_URL}${path}`, { ...options, headers })
    if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
    }
    return res.json()
}

export const api = {
    // Auth
    login: (phone, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
    changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

    // Users
    getUsers: () => request('/users'),
    getUser: (id) => request(`/users/${id}`),
    createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

    // Groups
    getGroups: () => request('/groups'),
    createGroup: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
    updateGroup: (id, data) => request(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),

    // Attendance
    getAttendance: (date) => request(`/attendance/${date}`),
    saveAttendance: (date, data) => request(`/attendance/${date}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Grades
    getGrades: (params = {}) => {
        const q = new URLSearchParams(params).toString()
        return request(`/grades${q ? '?' + q : ''}`)
    },
    addGrade: (data) => request('/grades', { method: 'POST', body: JSON.stringify(data) }),

    // Homework
    getHomeworks: () => request('/homeworks'),
    addHomework: (data) => request('/homeworks', { method: 'POST', body: JSON.stringify(data) }),
    toggleHomework: (id) => request(`/homeworks/${id}/toggle`, { method: 'PUT' }),
    deleteHomework: (id) => request(`/homeworks/${id}`, { method: 'DELETE' }),

    // Coins
    getCoinHistory: () => request('/coins/history'),
    earnCoins: (amount, reason) => request('/coins/earn', { method: 'POST', body: JSON.stringify({ amount, reason }) }),
    getTeacherAllocation: () => request('/coins/teacher-allocation'),
    giveCoinToStudent: (studentId, amount, reason) => request('/coins/give-to-student', { method: 'POST', body: JSON.stringify({ studentId, amount, reason }) }),

    // Shop
    getShopItems: () => request('/shop/items'),
    getOwnedItems: () => request('/shop/owned'),
    buyItem: (itemId) => request('/shop/buy', { method: 'POST', body: JSON.stringify({ itemId }) }),

    // Payments
    getPayments: () => request('/payments'),
    addPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
    updatePayment: (id, data) => request(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),
    payPayment: (paymentId, method, amount) => request('/payments/pay', { method: 'POST', body: JSON.stringify({ paymentId, method, amount }) }),
    getPaymentHistory: () => request('/payments/history'),

    // Topics
    getTopics: (groupId) => request(`/topics${groupId ? '?groupId='+groupId : ''}`),
    addTopic: (data) => request('/topics', { method: 'POST', body: JSON.stringify(data) }),
    updateTopic: (id, data) => request(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTopic: (id) => request(`/topics/${id}`, { method: 'DELETE' }),

    // Tests
    getTests: () => request('/tests'),
    submitTestResult: (data) => request('/test-results', { method: 'POST', body: JSON.stringify(data) }),
    getTestResults: () => request('/test-results'),

    // Teacher Payments (Salary)
    getTeacherPayments: () => request('/teacher-payments'),
    addTeacherPayment: (data) => request('/teacher-payments', { method: 'POST', body: JSON.stringify(data) }),
    payTeacherPayment: (id, method) => request(`/teacher-payments/${id}/pay`, { method: 'POST', body: JSON.stringify({ method }) }),
    updateTeacherPayment: (id, data) => request(`/teacher-payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTeacherPayment: (id) => request(`/teacher-payments/${id}`, { method: 'DELETE' }),

    // Homework Edit
    updateHomework: (id, data) => request(`/homeworks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Settings
    getSettings: () => request('/settings'),
    updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
}