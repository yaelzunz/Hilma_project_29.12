import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase/config'
import { Route, Routes, RouterProvider, useNavigate } from 'react-router-dom'
// Pages
import Login from '../pages/login'
import Signup from '../pages/signup'
import RestorePassword from '../pages/restore-password'
import PageNotFound from '../pages/404'
import Home from '../pages/home'
import Article from '../pages/article'
import Search from '../pages/search'
import { useEffect } from 'react'


/**
 * Component renders the current active page using `react-router-dom`. The component shold be renderen directly from `App.js`.
 */
function AppRouter() {
    // Auth state
    // Chech auth state, if no authorized redirect to login
    const navigate = useNavigate()
    const [user, loading, error] = useAuthState(auth)
    console.log(user, loading, error)
    
    // Effects
    useEffect(() => {
        if (!loading && !user) {
            // Auth unsuccessfull
            navigate('/login')
        }
    }, [user, loading])
        

    return (
        // משמש לסימון אזור התוכן הראשי של המסמך, לא כולל כותרות עליונות, כותרות תחתונות, סרגלי צד וקישורי ניווט - main
        <main>
            <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='login' element={<Login/>} />
                <Route path='signup' element={<Signup/>} />
                <Route path='home' element={<Home/>} />
                <Route path='search' element={<Search/>} />
                <Route path='article/:title' element={<Article/>} />
                <Route path='restore-password' element={<RestorePassword/>} />
                <Route path='*' element={<PageNotFound/>} />
            </Routes>
        </main>
    )
}

export default AppRouter