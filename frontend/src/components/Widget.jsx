import { useState, useEffect, useRef } from 'react';
import { getServiceData, deleteWidget } from '../services/api';

const TITLES = {
  coin_price: 'Prix en temps réel', coin_stats: 'Statistiques',
  coin_history: 'Historique 7 jours', top_coins: 'Top Cryptos',
  fear_greed: 'Fear & Greed', fear_greed_history: 'Historique Fear & Greed',
};

const fmt = (n) => {
  if (!n) return 'N/A';
  if (n >= 1e9) return `${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n/1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n/1e3).toFixed(2)}K`;
  return n.toFixed(2);
};

const cur = (c) => c?.toLowerCase() === 'eur' ? '€' : '$';
const fgColor = (v) => v < 25 ? 'text-red-500' : v < 50 ? 'text-orange-400' : v < 75 ? 'text-yellow-400' : 'text-green-400';
const fgBg = (v) => v < 25 ? 'bg-red-900' : v < 50 ? 'bg-orange-900' : v < 75 ? 'bg-yellow-900' : 'bg-green-900';
const fgBar = (v) => v < 25 ? '#ef4444' : v < 50 ? '#f97316' : v < 75 ? '#eab308' : '#22c55e';

export default function Widget({ widget, onDelete, onEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef(null);
  const hoverRef = useRef(false);
  const [size, setSize] = useState({ w: 400, h: 320 });

  useEffect(() => {
    const el = wrapperRef.current?.closest('.react-grid-item');
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const h = size.h - 48;
  const sm = Math.max(9, h * 0.045);
  const md = Math.max(11, h * 0.065);
  const px = Math.min(h * 0.22, size.w * 0.13);
  const tx = h * 0.1;
  const isSmall = size.h < 180 || size.w < 160;
  const isLarge = size.h > 450 && size.w > 450;

  const fetch_ = async () => {
    try {
      const cfg = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
      setData(await getServiceData(widget.service_id, widget.widget_type, cfg));
    } catch (_) {}
    finally {
      setLoading(false);
      if (hoverRef.current) setHovered(true);
    }
  };

  useEffect(() => {
    setLoading(true); setData(null); fetch_();
    const t = setInterval(fetch_, widget.refresh_rate * 1000);
    return () => clearInterval(t);
  }, [widget.config, widget.refresh_rate]);

  const cfg = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
  const $ = cur(cfg?.currency);

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteWidget(widget.id);
    onDelete(widget.id);
  };

  const content = () => {
    if (!data) return null;

    if (widget.widget_type === 'coin_price') {
      const chg = parseFloat(data.change_24h);
      return (
        <div className="flex flex-col justify-evenly h-full">
          <p className="text-white font-black uppercase" style={{fontSize:tx}}>{data.coin}</p>
          <p className="text-white font-black leading-none" style={{fontSize:px}}>{data.price?.toLocaleString()} <span style={{fontSize:px*0.75}}>{$}</span></p>
          <p className={chg>=0?'text-green-400':'text-red-400'} style={{fontSize:md}}>{chg>=0?'▲':'▼'} {Math.abs(chg)}% (24h)</p>
        </div>
      );
    }

    if (widget.widget_type === 'coin_stats') {
      return (
        <div className="flex flex-col justify-evenly h-full gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-black" style={{fontSize:tx}}>{data.name}</p>
            <span className="text-gray-400 font-medium" style={{fontSize:sm}}>{data.rank}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[['Market Cap', fmt(data.market_cap), true], ['Volume 24h', fmt(data.volume_24h), true], ['Supply', `${fmt(data.circulating_supply)} ${data.symbol}`, false]].map(([label, val, showCur], i) => (
              <div key={i} className={`bg-gray-700 rounded-xl p-3 flex flex-col justify-center ${i===2?'col-span-2':''}`}>
                <p className="text-gray-400 uppercase tracking-widest mb-1" style={{fontSize:sm}}>{label}</p>
                <p className="text-white font-bold" style={{fontSize:md}}>{val} {showCur?$:''}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (widget.widget_type === 'coin_history') {
      const valid = data.filter(d=>parseFloat(d.price)>0);
      const prices = valid.map(d=>parseFloat(d.price));
      const min = Math.min(...prices), max = Math.max(...prices);
      const displayed = isSmall ? valid.slice(0,4) : valid;
      return (
        <div className="flex flex-col h-full gap-2">
          <p className="text-white font-black uppercase shrink-0" style={{fontSize:tx}}>{cfg?.coin_id||'crypto'}</p>
          <div className="flex flex-col flex-1 justify-evenly">
            {displayed.map((item, i) => {
              const p = parseFloat(item.price);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-500 shrink-0" style={{fontSize:sm,minWidth:52}}>{item.date}</span>
                  {!isSmall && <div className="flex-1 bg-gray-700 rounded-full" style={{height:4}}><div className="bg-blue-500 rounded-full h-full" style={{width:`${((p-min)/(max-min))*100}%`}}/></div>}
                  <span className="text-white font-bold text-right shrink-0" style={{fontSize:md}}>{p.toLocaleString()} {$}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (widget.widget_type === 'top_coins') {
      return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
          {!isSmall && <p className="text-gray-400 uppercase tracking-widest shrink-0" style={{fontSize:sm}}>Classement crypto</p>}
          <div className="flex flex-col flex-1 min-h-0 justify-evenly">
            {data.slice(0,5).map((coin,i) => {
              const chg = parseFloat(coin.change_24h);
              return (
                <div key={i} className="flex justify-between items-center border-b border-gray-700 last:border-0 min-h-0 shrink" style={{padding:'2px 0'}}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 font-bold shrink-0" style={{fontSize:sm,width:16}}>{i+1}</span>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate" style={{fontSize:md}}>{isSmall?coin.symbol:coin.name}</p>
                      {!isSmall&&<p className="text-gray-500 truncate" style={{fontSize:sm}}>{coin.symbol}</p>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-white font-bold" style={{fontSize:md}}>{coin.price?.toLocaleString()} {$}</p>
                    <span className={chg>=0?'text-green-400':'text-red-400'} style={{fontSize:sm}}>{chg>=0?'+':''}{chg}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (widget.widget_type === 'fear_greed') {
      const v = parseInt(data.value);
      return (
        <div className="flex flex-col items-center justify-evenly h-full text-center">
          <p className={`font-black leading-none ${fgColor(v)}`} style={{fontSize:px*1.5}}>{v}</p>
          <p className={`font-bold ${fgColor(v)}`} style={{fontSize:md}}>{data.classification}</p>
          {!isSmall && (
            <div className="w-full">
              <div className="bg-gray-700 rounded-full" style={{height:6}}>
                <div style={{width:`${v}%`,height:'100%',borderRadius:9999,backgroundColor:fgBar(v)}}/>
              </div>
              <div className="flex justify-between text-gray-500 mt-1" style={{fontSize:sm}}>
                <span>Extreme Fear</span><span>Extreme Greed</span>
              </div>
              {data.avg && (
                <p className="text-gray-400 mt-2" style={{fontSize:sm}}>
                  Moyenne {data.days}j : <span className={`font-bold ${fgColor(data.avg)}`}>{data.avg}</span>
                </p>
              )}
              <p className="text-gray-500 mt-1" style={{fontSize:sm}}>{data.timestamp}</p>
            </div>
          )}
        </div>
      );
    }

    if (widget.widget_type === 'fear_greed_history') {
      if (!Array.isArray(data)) return null;
      return (
        <div className="flex flex-col h-full gap-2">
          <p className="text-gray-400 uppercase tracking-widest shrink-0" style={{fontSize:sm}}>{data.length} derniers jours</p>
          <div className="flex-1 min-h-0 flex items-end gap-0.5 px-1">
            {data.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none"
                  style={{
                    left: i < 3 ? 0 : i > data.length - 4 ? 'auto' : '50%',
                    right: i > data.length - 4 ? 0 : 'auto',
                    transform: i < 3 || i > data.length - 4 ? 'none' : 'translateX(-50%)'
                  }}>
                  <div className="bg-gray-900 border border-gray-600 text-white px-2 py-1 rounded whitespace-nowrap" style={{fontSize:10}}>
                    {item.date} — {item.value} ({item.classification})
                  </div>
                </div>
                <div className="w-full rounded-t" style={{height:`${item.value}%`,backgroundColor:fgBar(item.value),opacity:0.85,minHeight:4}}/>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div ref={wrapperRef} className="bg-gray-800 rounded-2xl border border-gray-600 h-full flex flex-col relative overflow-hidden"
      onMouseEnter={() => { hoverRef.current=true; setHovered(true); }}
      onMouseLeave={() => { hoverRef.current=false; setHovered(false); }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <span className="text-white font-bold select-none" style={{fontSize:12}}>{TITLES[widget.widget_type]}</span>
        <div className={`flex items-center gap-1.5 transition-opacity duration-150 ${hovered?'opacity-100':'opacity-0 pointer-events-none'}`}>
          <button onClick={(e)=>{e.stopPropagation();onEdit();}} className="text-gray-300 hover:text-white px-2 py-0.5 rounded border border-gray-600 hover:border-gray-400 transition text-xs cursor-pointer">Modifier</button>
          <button onClick={handleDelete} className="text-white px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 transition text-xs font-bold cursor-pointer">✕</button>
        </div>
      </div>
      <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500" style={{fontSize:md}}>Chargement...</p>
          </div>
        ) : content()}
      </div>
    </div>
  );
}