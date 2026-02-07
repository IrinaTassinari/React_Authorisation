// Импортируем хуки React:
// useState - чтобы хранить локальное состояние формы (что ввёл пользователь)
// useEffect - чтобы выполнить действие при "жизненных событиях" компонента (например, при первом рендере)
import { useState, useEffect } from 'react'

// Импортируем хуки из react-redux:
// useDispatch - чтобы отправлять действия (actions) в Redux store
// useSelector - чтобы читать данные из Redux store (состояние auth, ошибки, загрузку и т.п.)
import { useDispatch, useSelector } from 'react-redux'

// Импортируем thunk register из authThunks.
// thunk - это асинхронное действие (обычно запрос на сервер).
// register делает POST запрос на backend и возвращает результат (успех или ошибку).
import { register } from '../../features/auth/authThunks'

// Импортируем resetState из authSlice.
// resetState - обычный синхронный action, который очищает флаги:
// isLoading, isError, isSuccess и message.
// Это нужно, чтобы сообщения об успехе/ошибке не "залипали" при повторном заходе на страницу.
import { resetState } from '../../features/auth/authSlice'

// Компонент Register - страница/форма регистрации
const Register = () => {
    // formData - локальное состояние формы (то, что пользователь вводит в input'ы).
    // Мы храним:
    // - email
    // - password
    // - confirmPassword (повтор пароля, чтобы избежать опечатки)
    //
    // setFormData - функция, которая обновляет formData.
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

    // dispatch - функция для отправки действий в Redux.
    // Пример: dispatch(register(...)) или dispatch(resetState())
    const dispatch = useDispatch()

    // useSelector позволяет "достать" нужные данные из Redux store.
    //
    // (state) => state.auth - берём auth slice из общего состояния.
    // Мы достаём флаги:
    // - isLoading: идёт запрос на сервер или нет
    // - isError: была ли ошибка
    // - isSuccess: был ли успех
    // - message: сообщение об ошибке/ответе (если мы его сохранили)
    //
    // Эти значения приходят из authSlice (extraReducers).
    const { isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    // useEffect выполняется после рендера компонента.
    //
    // Здесь мы вызываем resetState при первом появлении компонента на экране,
    // чтобы очистить старые сообщения:
    // Например, если пользователь раньше уже пытался зарегистрироваться и была ошибка -
    // при повторном заходе на Register мы не хотим видеть старую ошибку.
    //
    // Почему в зависимости [dispatch]?
    // - Это стандартный паттерн: dispatch обычно стабильный, но линтер просит указать его в зависимостях.
    useEffect(() => {
        dispatch(resetState())
    }, [dispatch])

    // handleChange - обработчик изменения любого input.
    //
    // Как это работает:
    // e.target.name - имя поля (email / password / confirmPassword)
    // e.target.value - новое значение, которое ввёл пользователь
    //
    // Мы обновляем только одно поле, но сохраняем остальные через "...formData".
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // handleSubmit - обработчик отправки формы (нажатие кнопки Register или Enter).
    const handleSubmit = (e) => {
        // Отменяем стандартное поведение браузера:
        // По умолчанию form пытается отправить данные и перезагрузить страницу.
        // В SPA (React) нам это не нужно.
        e.preventDefault()

        // Простая валидация на клиенте:
        // проверяем, совпадают ли password и confirmPassword.
        // Если не совпадают - показываем alert и не отправляем запрос на сервер.
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match')
            return
        }

        // Если пароли совпали - отправляем запрос на сервер через thunk register.
        //
        // Мы передаём на сервер только email и password.
        // confirmPassword - это поле только для проверки на фронте.
        dispatch(register({ email: formData.email, password: formData.password }))
    }

    // Возвращаем JSX (разметку компонента)
    return (
        // onSubmit срабатывает при отправке формы.
        // Это удобно: работает и кнопка, и Enter.
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            {/* Input для email.
                name="email" - важно!
                Потому что handleChange использует e.target.name, чтобы понять,
                какое именно поле обновлять в formData.
            */}
            <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
            />

            {/* Input для password.
                type="password" скрывает символы при вводе.
            */}
            <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
            />

            {/* Input для confirmPassword (повтор пароля) */}
            <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
            />

            {/* Кнопка отправки формы.
                disabled={isLoading} - блокируем кнопку, пока идёт запрос на сервер,
                чтобы пользователь не нажимал много раз.
            */}
            <button disabled={isLoading}>
                Register
            </button>

            {/* Если произошла ошибка при регистрации - показываем сообщение.
                message берётся из Redux (thunkAPI.rejectWithValue на серверной ошибке).
            */}
            {isError && <p>{message}</p>}

            {/* Если регистрация успешная - показываем сообщение.
                isSuccess ставится в true в register.fulfilled.
            */}
            {isSuccess && <p>Registration successful!</p>}
        </form>
    )
}

// Экспортируем компонент Register, чтобы использовать его в маршрутах (Route)
export default Register
