import Login from './pages/Login';
import './App.scss'; // (Opcional, si aún tienes el archivo App.scss)

function App() {
    return (
        <div>
            {/* Aquí React intenta dibujar el Login. Si no lo importas arriba, explota. */}
            <Login />
        </div>
    );
}

export default App;