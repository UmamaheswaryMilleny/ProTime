import { BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";


export default function App() {
  return (
    <div>
      <Router>
        <AppRouter />
      </Router>
    </div>
  );
}