import {useEffect, useState} from 'react';
import './App.css';

function App() {
    const [estadoPath, setEstadoPath] = useState('');
    const [municipioPath, setMunicipioPath] = useState('');
    const [viewBox, setViewBox] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:3333/mapa/PB/Cajazeiras')
            .then(res => res.json())
            .then(data => {
                setEstadoPath(data.estadoPath);
                setMunicipioPath(data.municipioPath);
                setViewBox(data.viewBox);
                console.log('Estado Path:', data.estadoPath);
                console.log('Municipio Path:', data.municipioPath);
                console.log('ViewBox:', data.viewBox);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao carregar SVG:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>Mapa de Cajazeiras, PB</h1>
            {!loading && viewBox && (
                <svg viewBox="-42 7 10 0.1" preserveAspectRatio="xMidYMid meet" width="1000" height="500" style={{border: '1px solid #ccc'}}>
                    <path d={estadoPath} fill="#eee" stroke="#888" strokeWidth="0.1" />
                    <path d={municipioPath} fill="red" stroke="black" strokeWidth="0.1" />
                </svg>
            )}
        </div>
    );
}

export default App;
