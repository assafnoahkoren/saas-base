import { BrowserRouter as Router } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { MantineProvider } from './providers/MantineProvider';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <MantineProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </QueryProvider>
  );
}

export default App;
