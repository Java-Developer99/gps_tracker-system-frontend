import './App.css';
import AppRoutes from './routers/Routes';
import { BrowserRouter} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );
}

export default App;
