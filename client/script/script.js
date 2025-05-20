const estado = document.getElementById("estado");
const municipio = document.getElementById("municipio");

// Carrega estados do IBGE
fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
  .then(res => res.json())
  .then(estados => {
    estado.innerHTML = '<option value="">Selecione o estado</option>';
    estados.forEach(e => {
      estado.innerHTML += `<option value="${e.id}">${e.nome}</option>`;
    });
  });

// Ao selecionar um estado, carrega os municípios
estado.addEventListener("change", () => {
  const estadoId = estado.value;
  if (!estadoId) return;

  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
    .then(res => res.json())
    .then(municipios => {
      municipio.innerHTML = '<option value="">Selecione o município</option>';
      municipios.forEach(m => {
        municipio.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
      });
    });
});

