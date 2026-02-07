// Импортируем Routes и Route из react-router-dom.
// Это основа маршрутизации в React Router v6:
//
// - <Routes> - контейнер, который "выбирает", какой Route показать по текущему URL.
// - <Route>  - описывает: "если путь такой-то, показывай такой-то компонент".
import { Routes, Route } from 'react-router-dom'

// Импортируем lazy и Suspense из React.
//
// lazy() - позволяет загружать компонент "лениво" (не сразу при старте приложения,
// а только когда он реально нужен).
//
// Suspense - обёртка, которая показывает "заглушку" (fallback),
// пока ленивый компонент ещё не загрузился.
import { lazy, Suspense } from 'react'

// Импортируем Navbar - верхнее меню.
// Оно показывает разные ссылки в зависимости от token:
// - если token нет -> Login / Register
// - если token есть -> Profile / Logout
import Navbar from '../Navbar'

// Импортируем ProtectedRoute - компонент для защиты приватных страниц.
// Он проверяет token в Redux store.
// Если token нет -> делает редирект на /login.
// Если token есть -> показывает children (защищённую страницу).
import ProtectedRoute from '../ProtectedRoute'

// Импортируем Spinner - компонент загрузки.
// Он будет показан внутри Suspense, пока ленивые страницы загружаются.
import Spinner from '../Spinner'

/* =====================================================================================
   Lazy loading страниц
   =====================================================================================

   Здесь мы создаём "ленивые" версии страниц.

   Что это даёт?
   - Ускоряет старт приложения: не нужно грузить ВСЕ страницы сразу.
   - Код страницы загружается только тогда, когда пользователь переходит на неё.
   - Это называется "code splitting" (разделение кода на части).

   Как работает:
   - Когда пользователь впервые заходит на /login,
     React скачивает отдельный JS-файл для Login.
   - Пока файл скачивается, Suspense показывает <Spinner />.
*/

// Ленивый импорт страницы Home
const Home = lazy(() => import('../../pages/Home'))

// Ленивый импорт страницы Login
const Login = lazy(() => import('../../pages/Login'))

// Ленивый импорт страницы Register
const Register = lazy(() => import('../../pages/Register'))

// Ленивый импорт страницы Profile
const Profile = lazy(() => import('../../pages/Profile'))

/* =====================================================================================
   Компонент AppContent
   =====================================================================================

   AppContent - это "внутренности" приложения.
   Обычно в нём находятся:
   - Navbar
   - Routes/Route (все маршруты)
   - защитные маршруты (ProtectedRoute)
   - Suspense для lazy loading
*/
const AppContent = () => {
    return (
        <>
            {/* Navbar показывается всегда (на всех страницах).
                Он выше маршрутов, поэтому меню остаётся на месте,
                а страница меняется ниже.
            */}
            <Navbar />

            {/* Suspense нужен для lazy loading.
                Пока React загружает "ленивую" страницу (Home/Login/Register/Profile),
                будет показан fallback.

                fallback={<Spinner />} означает:
                "Пока компонент загружается - покажи спиннер".

                Как только страница загрузится, Spinner исчезнет и отрендерится страница.
            */}
            <Suspense fallback={<Spinner />}>
                {/* Routes содержит список маршрутов.
                    React Router смотрит на текущий URL и выбирает один Route.
                */}
                <Routes>
                    {/* Главная страница: если путь "/" -> показываем <Home /> */}
                    <Route path="/" element={<Home />} />

                    {/* Страница логина: если путь "/login" -> показываем <Login /> */}
                    <Route path="/login" element={<Login />} />

                    {/* Страница регистрации: если путь "/register" -> показываем <Register /> */}
                    <Route path="/register" element={<Register />} />

                    {/* Защищённая страница профиля:
                        Если путь "/profile" -> показываем элемент ниже.

                        Но мы НЕ рендерим <Profile /> напрямую!
                        Мы оборачиваем его в <ProtectedRoute>.

                        ProtectedRoute делает проверку:
                        - есть token? -> показывает children (<Profile />)
                        - нет token?  -> редиректит на "/login"
                    */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </>
    )
}

// Экспортируем AppContent, чтобы использовать в App.jsx внутри <Router>.
// Например:
// <Router>
//   <AppContent />
// </Router>
export default AppContent

/*
  Важно:

  1) Почему Navbar НЕ лениво грузим?
     Navbar нужен всегда. Он маленький и должен быть сразу.

  2) Почему страницы лениво грузим?
     Страницы часто большие и их много. Lazy loading ускоряет первую загрузку.

  3) Почему Suspense оборачивает Routes?
     Потому что внутри Routes есть lazy-компоненты.
     Suspense показывает fallback, пока любой из них загружается.

  4) ProtectedRoute защищает только то, что мы в него завернули.
     Если появится страница "/settings" - её тоже нужно обернуть.
*/
