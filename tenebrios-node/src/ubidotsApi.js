// Cliente HTTP para historico de Ubidots — replica de _fetch_ubidots_values.

import { UBIDOTS_TOKEN, DEVICE_LABEL } from './config.js';
import { getLogger } from './logger.js';

const logger = getLogger('ubidotsApi');

/**
 * Consulta valores historicos de una variable en Ubidots entre dos timestamps en ms.
 * Retorna el array data.results o [] si hay error.
 */
export async function fetchUbidotsValues(variableLabel, startMs, endMs) {
  const url =
    `https://industrial.api.ubidots.com/api/v1.6/devices/` +
    `${DEVICE_LABEL}/${variableLabel}/values` +
    `?start=${startMs}&end=${endMs}&page_size=5000`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const resp = await fetch(url, {
      headers: { 'X-Auth-Token': UBIDOTS_TOKEN },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!resp.ok) {
      logger.warn(`Ubidots respondio ${resp.status} para ${variableLabel}`);
      return [];
    }
    const data = await resp.json();
    return data.results || [];
  } catch (e) {
    clearTimeout(timeoutId);
    logger.warn(`Error consultando Ubidots para ${variableLabel}: ${e.message}`);
    return [];
  }
}
