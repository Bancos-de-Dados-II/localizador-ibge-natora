import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [estadoPath, setEstadoPath] = useState('');
    const [municipioPath, setMunicipioPath] = useState('');
    const [viewBox, setViewBox] = useState('');
    const [loading, setLoading] = useState(false);
    const [estados, setEstados] = useState([]);
    const [estadoSelected, setEstadoSelected] = useState("");
    const [municipios, setMunicipios] = useState([]);
    const [municipioSelected, setMunicipioSelected] = useState("");

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => {
                setEstados(data);
            })
            .catch(err => {
                console.error('Erro ao carregar SVG:', err);
            });
    }, []);

    useEffect(() => {
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelected}/municipios`)
            .then(res => res.json())
            .then(data => {
                setMunicipios(data)
            })
            .catch(err => {
                console.error('Erro ao carregar SVG:', err);
            });
    }, [estadoSelected]);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:3333/mapa/${estadoSelected}/${municipioSelected}`)
            .then(res => res.json())
            .then(data => {
                setEstadoPath(data.estadoPath);
                setMunicipioPath(data.municipioPath);
                setViewBox(data.viewBox);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao carregar SVG:', err);
                setLoading(false);
            });
    }, [municipioSelected]);

    return (
        <>
            <h1>Mapa dos Espalhas</h1>
            <div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '20px'
                }}>
                    <select onChange={(e) => {
                        setEstadoSelected(e.target.value);
                    }} >
                        {
                            estados[0] && (
                                estados.map((estado) => (
                                    <option value={estado.sigla}>{estado.nome}</option>
                                ))
                            )
                        }
                    </select>

                    {
                        municipios[0] && estadoSelected && (
                            <select onChange={(e) => {
                                setMunicipioSelected(e.target.value);
                            }} >
                                {
                                    municipios.map((municipio) => (
                                        <option value={municipio?.nome}>{municipio?.nome}</option>
                                    ))
                                }
                            </select>
                        )
                    }
                </div>
                {!loading && viewBox && (
                    <svg viewBox="-42 7 10 0.1" preserveAspectRatio="xMidYMid meet" width="1000" height="500" style={{ border: '1px solid #ccc' }}>
                        <path d={estadoPath} fill="#eee" stroke="#888" strokeWidth="0.1" />
                        <path d={municipioPath} fill="red" stroke="black" strokeWidth="0.1" />
                    </svg>
                )}
            </div>
        </>
    );
}

export default App;
