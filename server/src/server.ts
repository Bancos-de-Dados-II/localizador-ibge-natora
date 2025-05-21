import fastify from 'fastify';
import {env} from './config/env';
import {db} from './db/db';

export const app = fastify();

app.register(require('@fastify/cors'), {
    origin: '*'
});

app.get('/', async (request, reply) => {
    return {message: 'Bem Vindo, João Paulo Gayzinho Master!'};
});

app.get('/mapa/:estado/:municipio', async (request, reply) => {
    const {estado, municipio} = request.params as {estado: string; municipio: string};

    const estadoResult = await db.raw(
        `
    SELECT ST_AsSVG(geom) as svg_path
    FROM br_uf_2024
    WHERE sigla_uf = ?
  `,
        [estado.toUpperCase()]
    );

    if (!estadoResult.rows.length) {
        return reply.status(404).send({error: 'Estado não encontrado'});
    }

    const municipioDecoded = decodeURIComponent(municipio);
    const municipioPattern = `%${municipioDecoded}%`;

    const municipioResult = await db.raw(
        `
    SELECT ST_AsSVG(geom) as svg_path, nm_mun
    FROM br_municipios_2024
    WHERE nm_mun ILIKE ?
  `,
        [municipioPattern]
    );

    if (!municipioResult.rows.length) {
        return reply.status(404).send({error: 'Município não encontrado'});
    }
    const municipioExato = municipioResult.rows[0].nm_mun;
    const viewBoxResult = await db.raw(
        `
    SELECT getViewBox(?) as viewbox
  `,
        [municipioExato]
    );

    const estadoPath = estadoResult.rows[0].svg_path;
    const municipioPath = municipioResult.rows[0].svg_path;
    const viewBox = viewBoxResult.rows[0]?.viewbox;

    return {
        estadoPath,
        municipioPath,
        viewBox
    };
});

app.listen({port: env.PORT}).then(() => {
    console.log(`Server is running on port ${env.PORT}`);
});
