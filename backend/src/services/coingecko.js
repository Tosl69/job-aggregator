const BASE_URL = 'https://api.coingecko.com/api/v3';
const cache = {};
const CACHE_TTL = 60000;

const getCached = async (key, fetchFn) => {
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < CACHE_TTL) {
    return cache[key].data;
  }
  const data = await fetchFn();
  cache[key] = { data, ts: now };
  return data;
};

// --- Pure normalization helpers (no I/O, easily unit-testable) ---

const normalizePrice = (coin, currency, raw) => ({
  coin,
  price: raw[coin][currency],
  change_24h: raw[coin][`${currency}_24h_change`]?.toFixed(2)
});

const normalizeStats = (currency, raw) => ({
  name: raw.name,
  symbol: raw.symbol?.toUpperCase(),
  market_cap: raw.market_data.market_cap[currency],
  volume_24h: raw.market_data.total_volume[currency],
  circulating_supply: raw.market_data.circulating_supply,
  rank: raw.market_cap_rank
});

const normalizeHistoryPoint = ([timestamp, price]) => ({
  date: new Date(timestamp).toLocaleDateString('fr-FR'),
  price: price.toFixed(2)
});

const normalizeTopCoin = (raw) => ({
  name: raw.name,
  symbol: raw.symbol?.toUpperCase(),
  price: raw.current_price,
  change_24h: raw.price_change_percentage_24h?.toFixed(2)
});

const getData = async (widgetType, config) => {
  const coin = config.coin_id || 'bitcoin';
  const currency = config.currency || 'usd';

  if (widgetType === 'coin_price') {
    return getCached(`price_${coin}_${currency}`, async () => {
      const res = await fetch(`${BASE_URL}/simple/price?ids=${coin}&vs_currencies=${currency}&include_24hr_change=true`);
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
      const data = await res.json();
      return normalizePrice(coin, currency, data);
    });
  }

  if (widgetType === 'coin_stats') {
    return getCached(`stats_${coin}_${currency}`, async () => {
      const res = await fetch(`${BASE_URL}/coins/${coin}`);
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
      const data = await res.json();
      return normalizeStats(currency, data);
    });
  }

  if (widgetType === 'coin_history') {
    return getCached(`history_${coin}_${currency}`, async () => {
      const res = await fetch(`${BASE_URL}/coins/${coin}/market_chart?vs_currency=${currency}&days=7`);
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
      const data = await res.json();
      return data.prices.filter((_, i) => i % 24 === 0).map(normalizeHistoryPoint);
    });
  }

  if (widgetType === 'top_coins') {
    const ids = 'bitcoin,ethereum,solana,binancecoin,ripple';
    return getCached(`top_${currency}`, async () => {
      const res = await fetch(`${BASE_URL}/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&per_page=5&page=1`);
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
      const data = await res.json();
      return data.map(normalizeTopCoin);
    });
  }
};

module.exports = {
  getData,
  normalizePrice,
  normalizeStats,
  normalizeHistoryPoint,
  normalizeTopCoin
};