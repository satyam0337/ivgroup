import "vite/modulepreload-polyfill"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

ReactDOM.createRoot(document.getElementById("react-root")!).render(<App />)
