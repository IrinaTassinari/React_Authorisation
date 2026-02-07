// Импортируем NavLink из react-router-dom.
// NavLink - это "ссылка" для навигации внутри SPA (React-приложения).
//
// Чем NavLink отличается от обычного <a href="...">?
// - <a> делает полную перезагрузку страницы (как классический сайт)
// - NavLink меняет URL без перезагрузки (SPA), быстрее и удобнее
//
// Плюс: NavLink умеет автоматически добавлять стиль/класс "active",
// когда ссылка совпадает с текущим маршрутом (очень удобно для меню).
import { NavLink } from 'react-router-dom'

// Импортируем хуки из react-redux:
//
// useDispatch - нужен, чтобы отправлять actions в Redux store
// useSelector - нужен, чтобы читать состояние из Redux store
import { useDispatch, useSelector } from 'react-redux'

// Импортируем action logout из authSlice.
// logout - это синхронный action, который:
// - очищает token и user в Redux state
// - удаляет token из localStorage
//
// То есть после dispatch(logout()) пользователь считается разлогиненным.
import { logout } from '../../features/auth/authSlice'

// Navbar - компонент "верхнего меню" (навигации).
// Здесь мы показываем разные ссылки в зависимости от того,
// авторизован пользователь или нет.
const Navbar = () => {
    // Получаем dispatch, чтобы уметь отправлять действия в Redux.
    // Пример: dispatch(logout())
    const dispatch = useDispatch()

    // Раньше мы могли использовать useNavigate() для редиректа,
    // но сейчас у тебя это закомментировано:
    // const navigate = useNavigate()
    //
    // Это нормальный подход, если ты делаешь редирект иначе:
    // например через ProtectedRoute или через useEffect, который реагирует на token.
    // (Это даже "правильнее" архитектурно: Redux меняет state, а Router реагирует на state.)
    // const navigate = useNavigate()

    // Достаём token из Redux store.
    //
    // Если token есть -> пользователь авторизован.
    // Если token нет  -> пользователь не авторизован.
    //
    // Мы используем token, чтобы:
    // - скрывать Login/Register после входа
    // - показывать Profile/Logout после входа
    const { token } = useSelector((state) => state.auth)

    // handleLogout - функция, которая будет вызываться при клике "Logout".
    const handleLogout = () => {
        // Диспатчим logout.
        // После этого:
        // - token станет null в Redux state
        // - token удалится из localStorage
        // - UI перерисуется и начнёт показывать ссылки для НЕавторизованного пользователя
        dispatch(logout())

        // Если бы мы хотели сделать редирект прямо тут,
        // можно было бы вызвать navigate('/login').
        // Но ты отказался от этого (и это ок), потому что:
        // - ProtectedRoute сам не пустит на /profile без токена
        // - или другой код (например useEffect) может переводить на /login
        //
        // Главное: "logout" должен менять состояние, а "куда перейти" - решает роутинг.
        // navigate('/login')
    }

    // JSX разметка меню
    return (
        <nav>
            {/* Ссылка на главную страницу */}
            <NavLink to="/">Home</NavLink>{' '}

            {/* Если токена нет -> пользователь не авторизован.
                Тогда показываем ссылки на Login и Register.
            */}
            {!token && (
                <>
                    | <NavLink to="/login">Login</NavLink>{' '}
                    | <NavLink to="/register">Register</NavLink>
                </>
            )}

            {/* Если токен есть -> пользователь авторизован.
                Тогда показываем Profile и кнопку Logout.
            */}
            {token && (
                <>
                    | <NavLink to="/profile">Profile</NavLink>{' '}

                    {/* Кнопка выхода.
                        Лучше поставить type="button", чтобы кнопка не стала submit-кнопкой,
                        если Navbar вдруг окажется внутри <form>.
                    */}
                    | <button type="button" onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    )
}

// Экспортируем Navbar, чтобы использовать его в AppContent
export default Navbar

/*
  Важно:

  1) Navbar - это пример "условного UI":
     UI меняется в зависимости от состояния (token есть или нет).

  2) Мы не читаем localStorage напрямую здесь.
     Мы доверяем Redux state (state.auth.token).
     localStorage - это просто место хранения, а "истина" для UI - это store.

  3) Почему logout просто dispatch(logout()), без navigate?
     Потому что после logout UI уже меняется:
     - ссылки Login/Register появляются
     - Profile исчезает
     - ProtectedRoute не пустит на /profile без токена
     Если надо прям явно редиректить на /login, можно:
     - сделать navigate('/login') здесь
     - или сделать редирект в компоненте Profile
     - или сделать общий редирект для protected страниц через ProtectedRoute
*/
