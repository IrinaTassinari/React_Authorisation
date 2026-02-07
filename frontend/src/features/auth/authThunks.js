// Импортируем createAsyncThunk из Redux Toolkit.
// createAsyncThunk - это удобный способ создавать асинхронные actions (thunks).
//
// Thunk - это функция, которая умеет:
// 1) выполнять асинхронный код (например, HTTP запросы)
// 2) автоматически диспатчить 3 действия (actions):
//    - pending   (запрос начался)
//    - fulfilled (запрос успешно завершился, есть данные)
//    - rejected  (запрос завершился ошибкой)
//
// Эти 3 состояния мы обычно обрабатываем в extraReducers нашего authSlice.
import { createAsyncThunk } from '@reduxjs/toolkit'

// Импортируем axios - библиотеку для HTTP запросов (GET/POST/PUT/DELETE и т.д.).
// Мы используем axios, чтобы отправлять запросы на наш backend (Node/Express).
import axios from 'axios'

// Базовый URL нашего backend API.
// Мы вынесли его в константу, чтобы не повторять один и тот же адрес.
// Дальше мы будем добавлять к нему нужные пути:
// - register -> POST http://localhost:5000/api/auth/register
// - login    -> POST http://localhost:5000/api/auth/login
const API_URL = 'http://localhost:5000/api/auth/'

/* =====================================================================================
   Регистрация (register)
   ===================================================================================== */

// register - thunk для регистрации нового пользователя.
// Его обычно вызывают так:
// dispatch(register({ email: 'a@mail.com', password: '123' }))
//
// Что происходит внутри:
// 1) thunk отправляет запрос на сервер
// 2) RTK автоматически диспатчит:
//    - register.pending
//    - register.fulfilled (если успех)
//    - register.rejected  (если ошибка)
// 3) authSlice в extraReducers реагирует на эти действия и обновляет state.
export const register = createAsyncThunk(
    // Это "тип" action'а (id), по которому Redux будет понимать, что это за thunk.
    // В Redux DevTools ты увидишь:
    // auth/register/pending
    // auth/register/fulfilled
    // auth/register/rejected
    'auth/register',

    // payloadCreator - функция, которая выполняет асинхронную работу.
    // userData - данные, которые мы передали при dispatch(register(userData))
    // thunkAPI - объект-помощник от RTK (даёт полезные методы и данные).
    async (userData, thunkAPI) => {
        try {
            // Отправляем POST запрос на backend:
            // url: API_URL + 'register' -> http://localhost:5000/api/auth/register
            // body: userData -> { email, password }
            //
            // На backend (Node/Express) этот запрос обычно:
            // - проверяет пользователя
            // - создаёт нового пользователя в MongoDB
            // - возвращает ответ (например token или сообщение)
            const response = await axios.post(API_URL + 'register', userData)

            // Если запрос успешен - возвращаем response.data
            // RTK автоматически:
            // - диспатчит register.fulfilled
            // - положит это значение в action.payload
            // То есть в authSlice мы сможем получить данные так:
            // .addCase(register.fulfilled, (state, action) => { action.payload ... })
            return response.data
        } catch (error) {
            // Если запрос упал - мы хотим вернуть "красивое" сообщение об ошибке.
            //
            // error.response?.data?.message:
            // - error.response может не быть (например, если сервер не отвечает)
            // - поэтому используем optional chaining (?.), чтобы не было crash.
            //
            // Если message нет - используем запасной текст.
            const errorMessage =
                error.response?.data?.message || 'Registration error'

            // rejectWithValue позволяет передать свою ошибку в action.payload
            // (а не стандартный error.message).
            //
            // Это удобно, потому что в authSlice.rejected мы можем писать:
            // state.message = action.payload
            return thunkAPI.rejectWithValue(errorMessage)
        }
    }
)

/* =====================================================================================
   Логин (login)
   ===================================================================================== */

// login - thunk для входа пользователя.
// Его обычно вызывают так:
// dispatch(login({ email: 'a@mail.com', password: '123' }))
//
// Backend проверяет пароль и если всё ок - возвращает JWT token.
// Мы потом сохраняем этот token в Redux state и в localStorage (в authSlice).
export const login = createAsyncThunk(
    // Тип действия (id) для Redux DevTools:
    // auth/login/pending | auth/login/fulfilled | auth/login/rejected
    'auth/login',

    // payloadCreator: делает запрос на backend для логина.
    async (userData, thunkAPI) => {
        try {
            // POST запрос на:
            // http://localhost:5000/api/auth/login
            //
            // server обычно:
            // - ищет пользователя по email
            // - проверяет пароль (bcrypt compare)
            // - создаёт JWT
            // - возвращает { token: "..." } или похожий объект
            const response = await axios.post(API_URL + 'login', userData)

            // Возвращаем данные ответа.
            // Обычно response.data выглядит так:
            // { token: "JWT_TOKEN_STRING" }
            // Это попадёт в action.payload в fulfilled.
            return response.data
        } catch (error) {
            // Аналогичная обработка ошибок, как в register.
            // Если сервер вернул понятную ошибку - берём её.
            // Если нет - даём общий текст.
            const errorMessage =
                error.response?.data?.message || 'Login error'

            // Передаём эту ошибку в rejected action.payload
            return thunkAPI.rejectWithValue(errorMessage)
        }
    }
)

/* =====================================================================================
   Важно:
   =====================================================================================

1) Эти thunks не меняют state напрямую.
   Они только возвращают данные или ошибку.

2) Изменение state происходит в authSlice через extraReducers:
   - register.pending / fulfilled / rejected
   - login.pending / fulfilled / rejected

3) В thunk'ах мы держим только "async-логику":
   - запросы к серверу
   - обработку ошибок

4) UI-компоненты (Login/Register) просто вызывают:
   dispatch(login(formData))
   dispatch(register(formData))
*/
