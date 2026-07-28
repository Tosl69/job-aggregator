import { useState } from 'react';
import { updateWidget } from '../services/api';

const COIN_OPTIONS = [
  { label: 'Bitcoin (BTC)', value: 'bitcoin' },
  { label: 'Ethereum (ETH)', value: 'ethereum' },
  { label: 'Solana (SOL)', value: 'solana' },
  { label: 'BNB', value: 'binancecoin' },
  { label: 'XRP', value: 'ripple' },
  { label: 'Cardano (ADA)', value: 'cardano' },
  { label: 'Dogecoin (DOGE)', value: 'dogecoin' },
  { label: 'Polkadot (DOT)', value: 'polkadot' },
  { label: 'Polygon (MATIC)', value: 'matic-network' },
  { label: 'Litecoin (LTC)', value: 'litecoin' },
  { label: 'Chainlink (LINK)', value: 'chainlink' },
  { label: 'Avalanche (AVAX)', value: 'avalanche-2' },
  { label: 'Shiba Inu (SHIB)', value: 'shiba-inu' },
  { label: 'Tron (TRX)', value: 'tron' },
  { label: 'Toncoin (TON)', value: 'the-open-network' },
];

const CURRENCY_OPTIONS = [
  { label: 'Euro (EUR)', value: 'eur' },
  { label: 'Dollar (USD)', value: 'usd' },
];

const DAYS_OPTIONS = [
  { label: '7 jours', value: '7' },
  { label: '14 jours', value: '14' },
  { label: '30 jours', value: '30' },
];

const WIDGET_CONFIGS = {
  coin_price: ['coin_id', 'currency'],
  coin_stats: ['coin_id', 'currency'],
  coin_history: ['coin_id', 'currency'],
  top_coins: ['currency', 'limit'],
  fear_greed: ['days'],
  fear_greed_history: ['days'],
};

export default function EditWidgetModal({ widget, onClose, onSave }) {
  const initialConfig = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
  const [config, setConfig] = useState(initialConfig);
  const [refreshRate, setRefreshRate] = useState(widget.refresh_rate);
  const [loading, setLoading] = useState(false);

  const fields = WIDGET_CONFIGS[widget.widget_type] || [];

  const handleSave = async () => {
    setLoading(true);
    await updateWidget(widget.id, { config: { ...config, _ts: Date.now() }, refreshRate, position: widget.position });
    onSave();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        <h2 className="text-white text-lg font-bold mb-5">Modifier le widget</h2>
        <div className="space-y-4">
          {fields.includes('coin_id') && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Cryptomonnaie</label>
              <select value={config.coin_id || ''} onChange={e => setConfig({ ...config, coin_id: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
                {COIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          {fields.includes('currency') && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Devise</label>
              <select value={config.currency || 'eur'} onChange={e => setConfig({ ...config, currency: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
                {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          {fields.includes('days') && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Période</label>
              <select value={config.days || '7'} onChange={e => setConfig({ ...config, days: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
                {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          {fields.includes('limit') && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Nombre de cryptos</label>
              <select value={config.limit || '5'} onChange={e => setConfig({ ...config, limit: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
                {[5, 10, 15].map(n => <option key={n} value={n}>{n} cryptos</option>)}
              </select>
            </div>
          )}

          {fields.length === 0 && <p className="text-gray-400 text-sm">Aucun paramètre à modifier.</p>}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Rafraichissement (min. 60 sec)</label>
            <input type="number" value={refreshRate} min="60" onChange={e => setRefreshRate(Math.max(60, parseInt(e.target.value)))} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition">Annuler</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition">
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}