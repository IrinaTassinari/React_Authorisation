// Импортируем jwtDecode из библиотеки "jwt-decode".
// JWT (JSON Web Token) - это строка вида "xxxxx.yyyyy.zzzzz".
// jwtDecode(token) берёт эту строку и превращает её в обычный JS-объект
// (достаёт payload токена), чтобы мы могли прочитать данные пользователя.
import { jwtDecode } from 'jwt-decode'

// Импортируем useDispatch из react-redux.
// dispatch нужен, чтобы отправлять actions в Redux store.
// Например: dispatch(logout()) - "разлогинить пользователя".
import { useDispatch } from 'react-redux'

// Импортируем useNavigate из react-router-dom.
// useNavigate даёт функцию navigate(), которая позволяет программно
// переходить на другие страницы (без перезагрузки браузера).
import { useNavigate } from 'react-router-dom'

// Импортируем action logout из authSlice.
// logout - это синхронный reducer-action, который:
// - очищает state.user и state.token в Redux
// - удаляет token из localStorage
import { logout } from '../../features/auth/authSlice'

// Компонент Profile - страница профиля.
// Эта страница должна показывать данные пользователя, если он авторизован,
// либо сообщение, что нужно войти в аккаунт.
const Profile = () => {
    // dispatch - функция для отправки actions в Redux store.
    const dispatch = useDispatch()

    // navigate - функция для перехода на другой маршрут.
    // Пример: navigate('/login') перебросит на страницу логина.
    const navigate = useNavigate()

    // Достаём token из localStorage.
    // localStorage - это хранилище браузера (ключ-значение), данные там сохраняются
    // между перезапусками браузера.
    //
    // У нас токен сохраняется в localStorage в момент успешного login:
    // localStorage.setItem('token', action.payload.token)
    const token = localStorage.getItem('token')

    // Если токен есть - декодируем его, чтобы получить данные пользователя.
    // Если токена нет - user будет null (то есть пользователь не авторизован).
    //
    // jwtDecode НЕ проверяет подпись токена и НЕ проверяет срок действия.
    // Он просто "читает" payload.
    const user = token ? jwtDecode(token) : null

    // handleLogout - обработчик выхода из аккаунта.
    //
    // 1) dispatch(logout()) - очищает состояние auth + удаляет token из localStorage
    // 2) navigate('/login') - перекидывает пользователя на страницу входа
    //
    // Почему делаем logout через Redux, а не просто localStorage.removeItem('token')?
    // Потому что Redux должен "узнать", что пользователь вышел,
    // чтобы обновились интерфейс и логика доступа к защищённым страницам.
    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    // JSX разметка (то, что увидит пользователь)
    return (
        <div>
            <h2>Profile</h2>

            {/* Условный рендеринг:
                Если user существует (токен есть) - показываем информацию профиля и кнопку Logout.
                Если user === null - показываем сообщение "Login into account".
            */}
            {user ? (
                <>
                    {/* ВНИМАНИЕ:
                        Ты выводишь user.user.id.
                        Это значит, что payload твоего JWT выглядит примерно так:

                        {
                          "user": {
                            "id": "...."
                          },
                          "iat": ...,
                          "exp": ...
                        }

                        Если на backend структура другая (например { id: "..."}),
                        тогда нужно будет выводить user.id.
                    */}
                    <p>User ID: {user.user.id}</p>

                    {/* Кнопка выхода.
                        onClick вызывает handleLogout.
                        type="button" лучше поставить явно, чтобы кнопка не стала submit-кнопкой,
                        если вдруг этот компонент окажется внутри <form>.
                    */}
                    <button type="button" onClick={handleLogout}>
                        Logout
                    </button>
                </>
            ) : (
                // Если токена нет - пользователь не авторизован
                <p>Login into account</p>
            )}
        </div>
    )
}

// Экспортируем компонент Profile, чтобы использовать его в маршрутах (Route)
export default Profile
