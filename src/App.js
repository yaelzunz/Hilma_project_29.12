import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
// Styles
import './styles/global.css'
// Components
import AppRouter from './components/router'
import Header from './components/header'
import Menu from './components/menu'
import { PROTECTED_URLS } from './configs/url.config'


function App() {
  // States
  const [menuStatus, setMenuStatus] = useState(false)

  const pathname = window.location.pathname
  // PROTECTED_URLS המשתנה מוגדר על סמך האם שם הנתיב הנוכחי תואם לכל אחד מהנתיבים במערך .
  const isProtectedPage = PROTECTED_URLS.some(u => pathname.startsWith(u))

  // header will not appear in signup and login page
  const isLoginOrSignup = pathname === '/login' || pathname === '/signup' || pathname === '/'  ;

  return (
    <div className={`App ${isProtectedPage ? '' : 'non-protected'}`}>
      <BrowserRouter>

      {isLoginOrSignup ? null : <Header setMenu={setMenuStatus} />}

        {/* header */}
        {/* <Header setMenu={setMenuStatus} /> */}

        {/* menu : conditional rendering */}
        { menuStatus && <Menu setMenuStatus={setMenuStatus} /> }

        {/* dynamic page renderer */}
        <AppRouter />

        {/* app footer */}
        { isProtectedPage && <footer>
          <img src="/imgs/logo-footer.png" alt="Logo footer" />
        </footer> }

      </BrowserRouter>
    </div>
  )
}

export default App