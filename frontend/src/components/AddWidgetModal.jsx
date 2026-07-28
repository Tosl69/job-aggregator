import { useState, useEffect } from 'react';
import { getServices, addWidget } from '../services/api';

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

const WIDGET_LABELS = {
  coin_price: 'Prix en temps réel',
  coin_stats: 'Statistiques de marché',
  coin_history: 'Historique des prix (7 jours)',
  top_coins: 'Classement des cryptos',
  fear_greed: 'Indice Fear & Greed',
  fear_greed_history: 'Historique Fear & Greed',
};

const SERVICE_LABELS = {
  coingecko: 'CoinGecko — Prix & Marché',
  feargreed: 'Fear & Greed — Sentiment du marché',
};

const PARAM_LABELS = {
  coin_id: 'cryptomonnaie',
  currency: 'devise',
  limit: 'nombre de cryptos',
  days: 'période',
};

export default function AddWidgetModal({ onClose, onAdd }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedWidget, setSelectedWidget] = useState('');
  const [config, setConfig] = useState({ currency: 'eur', days: '7' });
  const [refreshRate, setRefreshRate] = useState(60);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => { getServices().then(setServices); }, []);

  const currentService = services.find(s => s.name === selectedService);
  const currentWidget = currentService?.widgets.find(w => w.name === selectedWidget);

  const handleSubmit = async () => {
    setValidationError('');
    if (!selectedService || !selectedWidget) { setValidationError('Veuillez choisir un service et un widget.'); return; }
    const missingParams = currentWidget?.params.filter(p => p.name !== 'currency' && p.name !== 'days' && p.name !== 'limit' && (!config[p.name] || config[p.name] === ''));
    if (missingParams?.length > 0) {
      setValidationError(`Champ(s) requis : ${missingParams.map(p => PARAM_LABELS[p.name] || p.name).join(', ')}`);
      return;
    }
    setLoading(true);
    await addWidget({ serviceId: selectedService, widgetType: selectedWidget, config, refreshRate, position: 0 });
    onAdd();
    onClose();
    setLoading(false);
  };

  const renderParamInput = (param) => {
    if (param.name === 'coin_id') return (
      <div key={param.name}>
        <label className="text-gray-400 text-sm mb-1 block">Cryptomonnaie</label>
        <select value={config[param.name] || ''} onChange={e => setConfig({ ...config, [param.name]: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
          <option value="">Choisir une crypto</option>
          {COIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
    if (param.name === 'currency') return (
      <div key={param.name}>
        <label className="text-gray-400 text-sm mb-1 block">Devise</label>
        <select value={config[param.name] || 'eur'} onChange={e => setConfig({ ...config, [param.name]: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
          {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
    if (param.name === 'days') return (
      <div key={param.name}>
        <label className="text-gray-400 text-sm mb-1 block">Période</label>
        <select value={config[param.name] || '7'} onChange={e => setConfig({ ...config, [param.name]: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
          {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
    if (param.name === 'limit') return (
      <div key={param.name}>
        <label className="text-gray-400 text-sm mb-1 block">Nombre de cryptos</label>
        <select value={config[param.name] || '5'} onChange={e => setConfig({ ...config, [param.name]: e.target.value })} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
          {[5, 10, 15].map(n => <option key={n} value={n}>{n} cryptos</option>)}
        </select>
      </div>
    );
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-700">
        <h2 className="text-white text-lg font-bold mb-5">Ajouter un widget</h2>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Source de données</label>
            <select value={selectedService} onChange={e => { setSelectedService(e.target.value); setSelectedWidget(''); setConfig({ currency: 'eur', days: '7' }); setValidationError(''); }} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
              <option value="">Choisir une source</option>
              {services.map(s => <option key={s.name} value={s.name}>{SERVICE_LABELS[s.name] || s.name}</option>)}
            </select>
          </div>
          {currentService && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Type de widget</label>
              <select value={selectedWidget} onChange={e => { setSelectedWidget(e.target.value); setConfig({ currency: 'eur', days: '7' }); setValidationError(''); }} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none">
                <option value="">Choisir un widget</option>
                {currentService.widgets.map(w => <option key={w.name} value={w.name}>{WIDGET_LABELS[w.name] || w.name}</option>)}
              </select>
            </div>
          )}
          {currentWidget?.params.map(param => renderParamInput(param))}
          {selectedWidget && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Rafraichissement (min. 60 sec)</label>
              <input type="number" value={refreshRate} min="60" onChange={e => setRefreshRate(Math.max(60, parseInt(e.target.value)))} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none" />
            </div>
          )}
          {validationError && <p className="text-white text-sm bg-red-600 px-3 py-2 rounded-lg">{validationError}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition">
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}