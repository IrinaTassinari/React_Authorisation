// Импортируем функцию configureStore из Redux Toolkit.
// Redux Toolkit (RTK) - это современный “правильный” способ писать Redux.
// configureStore делает за нас много полезного:
//
// 1) Создаёт Redux store (хранилище состояния приложения)
// 2) Автоматически подключает полезные middleware по умолчанию:
//    - thunk (для асинхронных запросов через createAsyncThunk)
//    - проверки на мутацию state (в dev режиме)
//    - проверки на сериализуемость данных (в dev режиме)
// 3) Подключает Redux DevTools (в dev режиме) - удобно для отладки
import { configureStore } from '@reduxjs/toolkit'

// Импортируем редьюсер (reducer) авторизации.
// authReducer - это "функция, которая знает как менять состояние auth части"
// Она создаётся внутри createSlice (authSlice.js) и экспортируется как default.
import authReducer from '../features/auth/authSlice'

// Импортируем наш кастомный middleware для проверки токена.
// Middleware - это "прослойка" между dispatch(action) и reducer.
// Оно может:
// - читать состояние store,
// - что-то логировать,
// - блокировать/изменять action,
// - делать дополнительные dispatch,
// - выполнять проверки (например, токен истёк -> разлогинить).
import { checkTokenExpirationMiddleware } from '../features/auth/auth.middleware'

// Создаём store.
// Store - это единый объект, который хранит состояние всего приложения.
// В React приложении обычно store подключается через <Provider store={store}> в index.js.
export const store = configureStore({
    // reducer - это объект всех "частей" состояния приложения (slices).
    //
    // Представь, что store - это большой шкаф, а reducer - это список "полок" в этом шкафу.
    // Здесь мы говорим:
    //
    // state.auth будет управляться authReducer
    //
    // То есть структура store будет такой:
    // {
    //   auth: {
    //     user: ...,
    //     token: ...,
    //     isLoading: ...,
    //     isError: ...,
    //     isSuccess: ...,
    //     message: ...
    //   }
    // }
    //
    // И когда мы делаем:
    // useSelector(state => state.auth.token)
    // мы достаём именно token из этой "полки".
    reducer: {
        auth: authReducer,
    },

    // middleware - это настройки middleware.
    //
    // RTK уже добавляет набор middleware по умолчанию:
    // getDefaultMiddleware()
    //
    // Мы не хотим их терять, потому что:
    // - thunk нужен для createAsyncThunk (register/login)
    // - проверки в dev режиме помогают ловить ошибки
    //
    // Поэтому мы берём дефолтные middleware и добавляем к ним наши:
    middleware: (getDefaultMiddleware) =>
        // concat(...) добавляет middleware в конец списка.
        //
        // Что это означает:
        // - сначала выполнятся встроенные middleware RTK
        // - потом выполнится наше checkTokenExpirationMiddleware
        //
        // Наш middleware будет проверять токен "на каждом action".
        // Если токен истёк - он сделает dispatch(logout()) и очистит auth.
        getDefaultMiddleware().concat(checkTokenExpirationMiddleware),
})

// Экспорт по умолчанию.
// Это удобно, чтобы импортировать store в index.js одной строкой:
// import store from './store/store'
export default store
