// Импортируем "BrowserRouter" и переименовываем его в "Router" для удобства.
// BrowserRouter - это компонент из react-router-dom, который:
//
// 1) "Слушает" адресную строку браузера (URL) и реагирует на её изменения.
// 2) Даёт всем вложенным компонентам доступ к роутингу через "контекст":
//    - useNavigate() - для переходов по страницам
//    - NavLink / Link - для ссылок
//    - Routes / Route - для описания маршрутов
//    - useParams(), useLocation() и т.д.
// 3) Без <BrowserRouter> большинство возможностей роутера просто не работает.
//
// Почему именно BrowserRouter?
// - Он использует HTML5 History API (pushState/replaceState).
// - То есть переходы происходят без перезагрузки страницы (SPA-поведение).
import { BrowserRouter as Router } from 'react-router-dom'

// Импортируем наш компонент AppContent.
// AppContent - это "внутренности" приложения: обычно там лежат:
// - Navbar (навигация),
// - <Routes> и <Route> (описание страниц),
// - ProtectedRoute (защищенные маршруты),
// - Lazy-loading страниц через React.lazy + Suspense.
//
// Мы специально вынесли AppContent отдельно от App, потому что:
// - Внутри AppContent можно безопасно использовать хуки роутера (useNavigate и т.д.)
// - А компонент App остаётся очень простым и отвечает только за "обёртку" Router.
import AppContent from './components/AppContent'

// Главный компонент приложения.
// Именно App обычно импортируется и рендерится в index.js (ReactDOM.createRoot(...).render(<App />)).
const App = () => {
  // Возвращаем JSX (то, что React отрисует на странице).
  return (
    // Router - это "контейнер" для всего приложения.
    // Всё, что находится внутри <Router>, получает доступ к роутингу.
    //
    // Важно:
    // - useNavigate/useLocation/useParams работают ТОЛЬКО внутри Router.
    // - Поэтому мы и оборачиваем AppContent в <Router>.
    //
    // Как это работает на практике:
    // - Пользователь кликает по NavLink -> URL меняется (например, /login)
    // - Router "видит" новый URL
    // - <Routes> внутри AppContent выбирает нужный <Route>
    // - React показывает нужную страницу (компонент)
    //
    // Плюс:
    // - переходы без перезагрузки страницы
    // - приложение ощущается "быстрым"
    <Router>
      {/* AppContent - всё содержимое приложения.
          Здесь находятся:
          - маршруты (<Routes> / <Route>)
          - страницы (Home/Login/Register/Profile)
          - защита маршрутов (ProtectedRoute)
          - возможно Lazy loading через <Suspense fallback={<Spinner />}>

          Мы держим App минимальным, чтобы:
          - легко читать
          - легко поддерживать
          - удобно масштабировать проект
      */}
      <AppContent />
    </Router>
  )
}

// Экспортируем App по умолчанию,
// чтобы его можно было импортировать в index.js так:
// import App from './App'
export default App
