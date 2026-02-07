// Импортируем хуки React:
// useState - хранит локальные данные формы (email и password), которые вводит пользователь
// useEffect - выполняет "побочные эффекты" (side effects), например редирект или сброс состояния
import { useState, useEffect } from 'react'

// Импортируем хуки из react-redux:
// useDispatch - чтобы отправлять actions/thunks в Redux store
// useSelector - чтобы читать состояние из Redux store (auth состояние: loading/error/success)
import { useDispatch, useSelector } from 'react-redux'

// useNavigate - хук react-router-dom для программной навигации.
// Позволяет "переключать страницы" кодом: navigate('/profile')
import { useNavigate } from 'react-router-dom'

// login - это thunk (асинхронное действие), которое отправляет запрос на сервер:
// POST /api/auth/login с { email, password }
// В случае успеха сервер возвращает JWT токен, и мы сохраняем его в Redux + localStorage
import { login } from '../../features/auth/authThunks'

// resetState - обычный синхронный action из authSlice.
// Он очищает флаги isLoading/isError/isSuccess и message.
// Это нужно, чтобы старые сообщения (успех/ошибка) не "залипали".
import { resetState } from '../../features/auth/authSlice'

// Компонент Login - страница / форма входа в аккаунт
const Login = () => {
    // Локальное состояние формы.
    // Здесь мы храним то, что пользователь вводит в поля.
    //
    // formData = { email: '...', password: '...' }
    // setFormData - функция обновления formData
    const [formData, setFormData] = useState({ email: '', password: '' })

    // dispatch - функция, которая "отправляет" actions в Redux.
    // Например: dispatch(login(formData))
    const dispatch = useDispatch()

    // navigate - функция, которая делает переход на другой маршрут.
    // Например: navigate('/profile') после успешного входа.
    // Важно: useNavigate работает только внутри <Router>.
    const navigate = useNavigate()

    // Берём нужные флаги из Redux (auth slice).
    //
    // isLoading - запрос на сервер идёт (true) или нет (false)
    // isError - была ошибка (например неверный пароль)
    // isSuccess - успешный логин (сервер вернул токен)
    // message - текст ошибки или сообщение, которое мы сохраняем при reject
    const { isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    // useEffect №1: Сброс состояния при первом рендере (при монтировании компонента).
    //
    // Почему нужно сбрасывать?
    // Представь:
    // - пользователь уже заходил на login раньше
    // - там была ошибка (isError=true, message="Wrong password")
    // - потом он ушёл и снова вернулся на страницу /login
    // Если мы НЕ сбросим состояние, старая ошибка останется и будет мешать.
    //
    // Этот эффект срабатывает один раз при появлении компонента на странице.
    useEffect(() => {
        dispatch(resetState())
    }, [dispatch])

    // useEffect №2: Редирект после успешного логина.
    //
    // Когда login thunk успешно завершится, в authSlice выставится:
    // isSuccess = true
    //
    // Мы "следим" за isSuccess и как только он становится true -
    // делаем переход на страницу профиля.
    //
    // Почему редирект делается в useEffect, а не сразу после dispatch(login())?
    // Потому что login - асинхронный запрос.
    // Если сделать navigate сразу после dispatch(login(formData)),
    // мы можем перейти на /profile ДО того, как сервер реально подтвердит вход.
    useEffect(() => {
        if (isSuccess) {
            navigate('/profile')
        }
    }, [isSuccess, navigate])

    // handleChange - функция для обновления полей формы при вводе.
    //
    // e.target.name - имя input (email или password)
    // e.target.value - введённое значение
    //
    // Мы копируем предыдущий объект formData (...formData)
    // и обновляем только одно поле по ключу [e.target.name]
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // handleSubmit - обработчик отправки формы
    const handleSubmit = (e) => {
        // ❗️Отключаем стандартную отправку формы браузером.
        // Иначе страница перезагрузится, а в SPA так не делают.
        e.preventDefault()

        // Отправляем thunk login в Redux.
        // Он:
        // 1) отправит запрос на backend
        // 2) при успехе сохранит token в Redux + localStorage
        // 3) выставит isSuccess=true
        // 4) наш useEffect сверху увидит isSuccess и сделает navigate('/profile')
        dispatch(login(formData))
    }

    // JSX разметка компонента
    return (
        // onSubmit работает и на кнопку, и на Enter
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {/* input для email.
                name="email" важен для handleChange (чтобы знать, какое поле обновлять).
            */}
            <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
            />

            {/* input для password.
                type="password" скрывает вводимые символы.
            */}
            <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
            />

            {/* Кнопка отправки формы.
                disabled={isLoading} - пока запрос идёт, блокируем кнопку,
                чтобы пользователь не нажимал её несколько раз подряд.
            */}
            <button disabled={isLoading}>
                Login
            </button>

            {/* Если произошла ошибка (например неверные данные),
                показываем текст ошибки из message.
            */}
            {isError && <p>{message}</p>}

            {/* Если логин успешен - показываем сообщение.
                (Но часто пользователь сразу улетает на /profile,
                поэтому это сообщение может мелькнуть на долю секунды.)
            */}
            {isSuccess && <p>Login successful!</p>}
        </form>
    )
}

// Экспортируем компонент, чтобы использовать его в маршрутах (Route)
export default Login
