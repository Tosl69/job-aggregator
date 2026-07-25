const coingecko = require('./coingecko');
const feargreed = require('./feargreed');

const cache = {};
const CACHE_TTL = 60000;

const getCached = async (key, fetchFn) => {
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < CACHE_TTL) return cache[key].data;
  const data = await fetchFn();
  cache[key] = { data, ts: now };
  return data;
};

const servicesList = [
  {
    name: 'coingecko',
    widgets: [
      { name: 'coin_price', description: 'Prix en temps réel', params: [{ name: 'coin_id', type: 'string' }, { name: 'currency', type: 'string' }] },
      { name: 'coin_stats', description: 'Statistiques détaillées', params: [{ name: 'coin_id', type: 'string' }, { name: 'currency', type: 'string' }] },
      { name: 'coin_history', description: 'Historique 7 jours', params: [{ name: 'coin_id', type: 'string' }, { name: 'currency', type: 'string' }] },
      { name: 'top_coins', description: 'Top cryptos', params: [{ name: 'currency', type: 'string' }, { name: 'limit', type: 'integer' }] }
    ]
  },
  {
    name: 'feargreed',
    widgets: [
      { name: 'fear_greed', description: 'Indice Fear & Greed + moyenne', params: [{ name: 'days', type: 'integer' }] },
      { name: 'fear_greed_history', description: 'Historique Fear & Greed', params: [{ name: 'days', type: 'integer' }] }
    ]
  }
];

const getAll = () => servicesList;

const getData = async (serviceId, widgetType, config) => {
  if (serviceId === 'feargreed') {
    return await feargreed.getData(widgetType, config);
  }
  const key = `${serviceId}_${widgetType}_${JSON.stringify(config)}`;
  return getCached(key, async () => {
    switch (serviceId) {
      case 'coingecko': return await coingecko.getData(widgetType, config);
      default: throw new Error('Service non trouvé');
    }
  });
};

module.exports = { getAll, getData };