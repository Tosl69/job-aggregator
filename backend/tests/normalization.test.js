const {
  normalizePrice,
  normalizeStats,
  normalizeHistoryPoint,
  normalizeTopCoin
} = require('../src/services/coingecko');

describe('CoinGecko data normalization', () => {
  it('normalizePrice extracts price and rounds the 24h change', () => {
    const raw = { bitcoin: { usd: 56000.5, usd_24h_change: -1.4567 } };
    const result = normalizePrice('bitcoin', 'usd', raw);
    expect(result).toEqual({ coin: 'bitcoin', price: 56000.5, change_24h: '-1.46' });
  });

  it('normalizeStats uppercases the symbol and picks the right currency fields', () => {
    const raw = {
      name: 'Bitcoin',
      symbol: 'btc',
      market_data: {
        market_cap: { usd: 1000000, eur: 900000 },
        total_volume: { usd: 50000, eur: 45000 },
        circulating_supply: 19000000
      },
      market_cap_rank: 1
    };
    const result = normalizeStats('eur', raw);
    expect(result).toEqual({
      name: 'Bitcoin',
      symbol: 'BTC',
      market_cap: 900000,
      volume_24h: 45000,
      circulating_supply: 19000000,
      rank: 1
    });
  });

  it('normalizeHistoryPoint formats the timestamp and rounds the price', () => {
    const result = normalizeHistoryPoint([1700000000000, 42123.456]);
    expect(result.price).toBe('42123.46');
    expect(typeof result.date).toBe('string');
    expect(result.date.length).toBeGreaterThan(0);
  });

  it('normalizeTopCoin uppercases the symbol and rounds the 24h change', () => {
    const raw = { name: 'Ethereum', symbol: 'eth', current_price: 3000, price_change_percentage_24h: 2.4444 };
    const result = normalizeTopCoin(raw);
    expect(result).toEqual({ name: 'Ethereum', symbol: 'ETH', price: 3000, change_24h: '2.44' });
  });
});