import {useEffect, useState} from 'react';
import './App.css';
import {Autocomplete, TextField} from '@mui/material';

function App() {
    const [estadoPath, setEstadoPath] = useState('');
    const [municipioPath, setMunicipioPath] = useState('');
    const [viewBox, setViewBox] = useState('');
    const [loading, setLoading] = useState(false);
    const [estados, setEstados] = useState([]);
    const [estadoSelected, setEstadoSelected] = useState(null);
    const [municipios, setMunicipios] = useState([]);
    const [municipioSelected, setMunicipioSelected] = useState(null);

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => {
                setEstados(data);
            })
            .catch(err => {
                console.error('Erro ao carregar estados:', err);
            });
    }, []);

    useEffect(() => {
        if (estadoSelected) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelected.id}/municipios`)
                .then(res => res.json())
                .then(data => {
                    setMunicipios(data);
                })
                .catch(err => {
                    console.error('Erro ao carregar municípios:', err);
                });
        } else {
            setMunicipios([]);
            setMunicipioSelected(null);
        }
    }, [estadoSelected]);

    useEffect(() => {
        if (estadoSelected && municipioSelected) {
            setLoading(true);
            fetch(`http://localhost:3333/mapa/${estadoSelected.sigla}/${municipioSelected.nome}`)
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
        } else {
            setEstadoPath('');
            setMunicipioPath('');
            setViewBox('');
        }
    }, [estadoSelected, municipioSelected]);

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <h1 style={{textAlign: 'center', marginBottom: '30px', color: '#333'}}>🗺️ Mapa dos Espalhas</h1>

            <div className="select-container">
                <Autocomplete
                    disablePortal
                    options={estados}
                    getOptionLabel={option => option.nome}
                    sx={{width: 300}}
                    value={estadoSelected}
                    onChange={(event, newValue) => setEstadoSelected(newValue)}
                    renderInput={params => <TextField {...params} label="Estado" />}
                />

                <Autocomplete
                    disablePortal
                    options={municipios}
                    getOptionLabel={option => option.nome}
                    sx={{width: 300}}
                    value={municipioSelected}
                    onChange={(event, newValue) => setMunicipioSelected(newValue)}
                    renderInput={params => <TextField {...params} label="Município" />}
                    disabled={!estadoSelected}
                />
            </div>

            <div className="map-container">
                {!loading && viewBox ? (
                    <svg
                        viewBox="-41 2 8 10"
                        preserveAspectRatio="xMidYMid meet"
                        width="100%"
                        height="100%"
                        style={{maxWidth: '1000px', maxHeight: '600px'}}
                    >
                        <path d={estadoPath} fill="#e0e0e0" stroke="#888" strokeWidth="0.02" />
                        <path d={municipioPath} fill="#ff5252" stroke="#333" strokeWidth="0.02" />
                    </svg>
                ) : loading ? (
                    <p style={{fontSize: '18px', color: '#666'}}>Carregando mapa...</p>
                ) : (
                    <p style={{fontSize: '18px', color: '#999'}}>Selecione um estado e um município para exibir o mapa.</p>
                )}
            </div>
        </div>
    );
}

export default App;
