// Импортируем action logout из authSlice.
// logout это синхронное действие (action), которое:
// - очищает user и token в Redux state
// - удаляет token из localStorage
//
// Мы будем вызывать logout автоматически, если токен "просрочился".
import { logout } from './authSlice'

// Импортируем функцию isTokenExpired из auth.utils.
// Она декодирует JWT и проверяет поле exp (срок действия токена).
// Если токен истёк вернёт true.
import { isTokenExpired } from './auth.utils'

/* =====================================================================================
   Middleware: checkTokenExpirationMiddleware
   =====================================================================================

Middleware в Redux это "прослойка" между dispatch(action) и reducer.

То есть поток действий выглядит так:

  dispatch(action)
        ↓
   middleware (может что-то сделать)
        ↓
     reducer (изменяет state)
        ↓
   обновление UI (React перерисовывается)

Middleware может:
- читать текущее состояние store (store.getState())
- выполнять дополнительную логику (проверки, логирование)
- диспатчить другие actions (store.dispatch(...))
- пропускать action дальше (next(action))

ЭТО НЕ МЕСТО ДЛЯ HTTP ЗАПРОСОВ (для этого есть thunks),
но это отличное место для "автоматических проверок",
например истечение токена.
*/

// Создаём middleware.
// Redux middleware это функция особой формы (каррирование):
//
// (store) => (next) => (action) => { ... }
//
// Разберём по частям:
//
// 1) store объект Redux store, у него есть методы:
//    - getState()   -> получить текущее состояние
//    - dispatch()   -> отправить action
//
// 2) next функция, которая передаёт action дальше по цепочке middleware,
//    а потом в reducer.
//
// 3) action текущее действие, которое кто-то вызвал через dispatch(action).
export const checkTokenExpirationMiddleware =
   (store) => (next) => (action) => {
      // Берём токен из Redux state.
      // store.getState() возвращает весь state приложения.
      // У нас структура состояния такая:
      // state = { auth: { token, user, isLoading, ... } }
      //
      // Поэтому берём: state.auth.token
      const token = store.getState().auth.token

      // Если токен есть и он истёк разлогиниваем пользователя.
      //
      // token && ... защита: если token = null, то проверку не делаем.
      // isTokenExpired(token) вернёт true, если токен просрочен (exp < now).
      if (token && isTokenExpired(token)) {
         // Автоматически диспатчим logout().
         // Это очистит auth state и удалит token из localStorage.
         //
         // Так пользователь будет автоматически "вылогинен",
         // даже если он просто сидит в приложении и токен закончился.
         store.dispatch(logout())
      }

      // Очень важная строка!
      // next(action) мы обязательно передаём исходный action дальше,
      // чтобы приложение продолжало работать как обычно.
      //
      // Если НЕ вызвать next(action), то action "застрянет" в middleware
      // и reducers никогда не получат его -> состояние не обновится.
      return next(action)
   }

/* =====================================================================================
   Важно:
   =====================================================================================

1) Почему middleware срабатывает "часто"?
   Оно будет запускаться на КАЖДЫЙ dispatch(action) в приложении.
   Поэтому логика в middleware должна быть лёгкой и быстрой.

2) Зачем проверять токен тут, а не только на странице Profile?
   Потому что middleware работает глобально:
   - пользователь может быть на любой странице
   - токен может истечь в любой момент
   - middleware сам разлогинит, и UI обновится

3) Можно ли здесь сделать редирект на /login?
   Лучше НЕ делать навигацию внутри middleware напрямую.
   Middleware это Redux-слой (логика состояния), а редирект слой Router/UI.
   Правильнее:
   - middleware делает logout()
   - UI (например ProtectedRoute или useEffect) реагирует на token=null
     и делает navigate('/login').

4) Что если jwtDecode упадёт (битый токен)?
   В isTokenExpired лучше иметь try/catch и возвращать true,
   чтобы "сломаный" токен считался недействительным.
*/
