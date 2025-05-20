import fastify from "fastify";
import { env } from "./config/env";
import { db } from "./db/db";

export const app = fastify();

app.register(require("@fastify/cors"), {
  origin: "*",
});

app.get("/", async (request, reply) => {
  return { message: "Bem Vindo, João Paulo Gayzinho Master!" };
});

app.get("/mapa/:estado/:municipio", async (request, reply) => {
  const { estado, municipio } = request.params as { estado: string; municipio: string };

  // Consulta para pegar o path SVG do estado pela sigla da UF
  const estadoResult = await db.raw(`
    SELECT ST_AsSVG(geom, 0, 8) as svg_path
    FROM estados
    WHERE sigla_uf = ?
    LIMIT 1
  `, [estado.toUpperCase()]);

  if (!estadoResult.rows.length) {
    return reply.status(404).send({ error: "Estado não encontrado" });
  }

  const municipioDecoded = decodeURIComponent(municipio);
  const municipioPattern = `%${municipioDecoded}%`;

  // Consulta para pegar o path SVG do município usando ILIKE com %
  const municipioResult = await db.raw(`
    SELECT ST_AsSVG(geom, 0, 8) as svg_path, nm_mun
    FROM municipios
    WHERE nm_mun ILIKE ?
      AND sigla_uf = ?
    LIMIT 1
  `, [municipioPattern, estado.toUpperCase()]);

  if (!municipioResult.rows.length) {
    return reply.status(404).send({ error: "Município não encontrado" });
  }

  // Obtém o nome exato do município encontrado para usar na função getViewBox
  const municipioExato = municipioResult.rows[0].nm_mun;

  // Consulta para pegar o viewBox chamando a função PL/pgSQL getViewBox
  const viewBoxResult = await db.raw(`
    SELECT getViewBox(?) as viewbox
  `, [municipioExato]);

  const estadoPath = estadoResult.rows[0].svg_path;
  const municipioPath = municipioResult.rows[0].svg_path;
  const viewBox = viewBoxResult.rows[0]?.viewbox || "0 0 100 100";

  return {
    estadoPath,
    municipioPath,
    viewBox,
  };
});

// Nova rota para depuração
app.get("/debug/:estado/:municipio", async (request, reply) => {
  const { estado, municipio } = request.params as { estado: string; municipio: string };
  const municipioDecoded = decodeURIComponent(municipio);
  
  try {
    // Consultas para depuração
    const estadoResult = await db.raw(`
      SELECT 
        ST_AsSVG(geom, 0, 8) as svg_path,
        ST_AsText(geom) as wkt,
        ST_SRID(geom) as srid
      FROM estados
      WHERE sigla_uf = ?
      LIMIT 1
    `, [estado.toUpperCase()]);
    
    const municipioResult = await db.raw(`
      SELECT 
        ST_AsSVG(geom, 0, 8) as svg_path,
        ST_AsText(geom) as wkt,
        ST_SRID(geom) as srid,
        nm_mun
      FROM municipios
      WHERE nm_mun ILIKE ?
        AND sigla_uf = ?
      LIMIT 1
    `, [`%${municipioDecoded}%`, estado.toUpperCase()]);
    
    // Informações sobre o viewBox
    const viewBoxResult = await db.raw(`
      SELECT 
        getViewBox(?) as viewbox,
        ST_XMin(ST_Envelope(geom)) as xmin,
        ST_YMin(ST_Envelope(geom)) as ymin,
        ST_XMax(ST_Envelope(geom)) as xmax,
        ST_YMax(ST_Envelope(geom)) as ymax
      FROM municipios
      WHERE nm_mun = ?
      LIMIT 1
    `, [municipioResult.rows[0]?.nm_mun || municipioDecoded, municipioResult.rows[0]?.nm_mun || municipioDecoded]);
    
    return {
      estado: {
        info: estadoResult.rows[0] || null
      },
      municipio: {
        info: municipioResult.rows[0] || null
      },
      viewBox: {
        calculado: viewBoxResult.rows[0]?.viewbox || null,
        componentes: viewBoxResult.rows[0] || null
      }
    };
  } catch (error: unknown) {
    console.error("Erro na rota de debug:", error);
    return {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    };
  }
});

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server is running on port ${env.PORT}`);
});