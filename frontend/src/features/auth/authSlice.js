// Импортируем createSlice из Redux Toolkit.
// createSlice - это удобный способ создать:
// 1) начальное состояние (initialState)
// 2) reducers (синхронные изменения состояния)
// 3) actions (автоматически создаются по именам reducers)
// 4) reducer-функцию, которую мы подключаем в store
import { createSlice } from '@reduxjs/toolkit'

// Импортируем jwtDecode из "jwt-decode".
// JWT токен - это строка, внутри которой (в payload) лежит информация о пользователе.
// jwtDecode(token) превращает токен-строку в объект, чтобы мы могли прочитать данные.
// Важно: jwtDecode НЕ проверяет подпись и НЕ проверяет срок действия токена,
// он только "читает" данные из токена.
import { jwtDecode } from 'jwt-decode'

// Импортируем асинхронные thunk'и register и login.
// Эти thunk'и находятся в отдельном файле authThunks.js и делают HTTP запросы к backend.
//
// createAsyncThunk автоматически создаёт 3 action'а для каждого thunk:
// - pending   (запрос начался)
// - fulfilled (запрос успешен)
// - rejected  (ошибка)
//
// Мы будем "слушать" эти действия в extraReducers.
import { register, login } from './authThunks'

/* =====================================================================================
   initialState - начальное состояние авторизации (auth state)
   ===================================================================================== */

// initialState - это то, как выглядит состояние auth при первом запуске приложения.
// Это объект, который будет лежать в store примерно так:
// state.auth = initialState (после первого запуска)
const initialState = {
    // user - объект с данными пользователя (получаем из JWT после логина).
    // Пока пользователь не вошёл - null.
    user: null,

    // token - JWT токен, который мы пытаемся взять из localStorage.
    // Если пользователь уже заходил в аккаунт раньше, token может там сохраняться,
    // и тогда после перезагрузки страницы мы "помним" авторизацию.
    // Если токена нет - будет null.
    token: localStorage.getItem('token'),

    // isLoading - флаг, что сейчас идёт запрос (login/register).
    // Используем, чтобы например отключать кнопку или показывать спиннер.
    isLoading: false,

    // isError - флаг, что произошла ошибка при запросе.
    // Например: неверный пароль, пользователь уже существует и т.д.
    isError: false,

    // isSuccess - флаг, что операция прошла успешно.
    // Например: регистрация или вход успешно выполнены.
    // Важно: этот флаг обычно нужно сбрасывать (resetState),
    // иначе он будет "залипать" и мешать UI.
    isSuccess: false,

    // message - сообщение об ошибке (или другое сообщение для UI).
    // Например: "Invalid credentials"
    message: '',
}

/* =====================================================================================
   createSlice - создаём authSlice
   ===================================================================================== */

const authSlice = createSlice({
    // name - имя slice.
    // Оно используется для генерации type у actions:
    // например, resetState будет иметь type: "auth/resetState"
    name: 'auth',

    // initialState - начальное состояние нашего slice
    initialState,

    // reducers - синхронные действия.
    // Это "обычные" actions, которые мы можем диспатчить вручную:
    // dispatch(resetState())
    // dispatch(logout())
    reducers: {
        // resetState - сбрасывает флаги в "нейтральное" состояние.
        //
        // Зачем это нужно?
        // Представь:
        // - пользователь попытался залогиниться, была ошибка -> isError=true, message="..."
        // - потом он снова открыл страницу login
        // Если не сбрасывать state, старая ошибка будет висеть и путать пользователя.
        //
        // Мы сбрасываем:
        // isLoading/isError/isSuccess и message (но НЕ трогаем token/user).
        resetState: (state) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = false
            state.message = ''
        },

        // logout - выход из аккаунта.
        //
        // Что делаем при выходе:
        // 1) очищаем user в Redux state
        // 2) очищаем token в Redux state
        // 3) удаляем token из localStorage (чтобы после перезагрузки он не вернулся)
        //
        // Этот action можно вызвать:
        // - по кнопке Logout
        // - автоматически, если токен истёк (через middleware)
        logout: (state) => {
            state.user = null
            state.token = null
            localStorage.removeItem('token')
        },
    },

    // extraReducers - обработка "внешних" actions.
    //
    // Почему "extra"?
    // Потому что actions register/login создаются НЕ в этом slice,
    // а в authThunks.js через createAsyncThunk.
    //
    // Поэтому мы не можем писать их в reducers - для этого есть extraReducers.
    extraReducers: (builder) => {
        builder
            /* ===========================
               REGISTER (регистрация)
               =========================== */

            // register.pending - запрос на регистрацию начался
            .addCase(register.pending, (state) => {
                state.isLoading = true
            })

            // register.fulfilled - регистрация прошла успешно
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false
                state.isSuccess = true

                // В твоей логике регистрация может не возвращать токен,
                // поэтому здесь мы НЕ сохраняем token/user.
                // (Если backend возвращает token сразу при регистрации -
                // тогда тут можно сохранить token аналогично login.fulfilled.)
            })

            // register.rejected - ошибка регистрации
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true

                // action.payload - это наше "красивое" сообщение,
                // которое мы передали через thunkAPI.rejectWithValue(...)
                state.message = action.payload
            })

            /* ===========================
               LOGIN (вход)
               =========================== */

            // login.pending - запрос на вход начался
            .addCase(login.pending, (state) => {
                state.isLoading = true
            })

            // login.fulfilled - вход успешен, сервер вернул токен
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true

                // action.payload - данные ответа от сервера.
                // Обычно backend возвращает что-то вроде:
                // { token: "JWT_TOKEN_STRING" }
                state.token = action.payload.token

                // Декодируем токен, чтобы получить данные пользователя.
                // Например, в токене может быть userId, email, role и т.д.
                // Результат jwtDecode - это объект payload токена.
                state.user = jwtDecode(action.payload.token)

                // Сохраняем токен в localStorage,
                // чтобы после перезагрузки страницы авторизация сохранилась.
                localStorage.setItem('token', action.payload.token)
            })

            // login.rejected - ошибка входа
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

/* =====================================================================================
   Экспорты
   ===================================================================================== */

// authSlice.actions - объект со всеми actions, созданными из reducers.
// Мы вытаскиваем два action creator'а:
// resetState() и logout()
export const { resetState, logout } = authSlice.actions

// Экспортируем reducer (функцию), которую подключаем в store:
// reducer: { auth: authReducer }
export default authSlice.reducer

/* =====================================================================================
   Важно:
   =====================================================================================

1) reducers - это синхронные действия (мы вызываем их сами):
   dispatch(resetState())
   dispatch(logout())

2) extraReducers - это реакция на асинхронные thunk'и (register/login):
   register.pending/fulfilled/rejected
   login.pending/fulfilled/rejected

3) createAsyncThunk создаёт эти 3 стадии автоматически.

4) Почему можно "мутировать" state (state.isLoading = true)?
   Потому что внутри createSlice используется библиотека Immer.
   Immer под капотом создаёт копию состояния безопасно,
   а нам позволяет писать код "как будто" мы мутируем.
*/
