const getData = async (widgetType, config) => {
  const limit = parseInt(config.days) || 7;

  if (widgetType === 'fear_greed') {
    const [resNow, resHistory] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1'),
      fetch(`https://api.alternative.me/fng/?limit=${limit}`)
    ]);
    const now = await resNow.json();
    const history = await resHistory.json();
    const item = now.data[0];
    const avg = Math.round(history.data.reduce((sum, d) => sum + parseInt(d.value), 0) / history.data.length);
    return {
      value: item.value,
      classification: item.value_classification,
      timestamp: new Date(item.timestamp * 1000).toLocaleDateString('fr-FR'),
      avg,
      days: limit
    };
  }

  if (widgetType === 'fear_greed_history') {
    const res = await fetch(`https://api.alternative.me/fng/?limit=${limit}`);
    if (!res.ok) throw new Error('Fear & Greed API error');
    const data = await res.json();
    return data.data.map(item => ({
      value: parseInt(item.value),
      classification: item.value_classification,
      date: new Date(item.timestamp * 1000).toLocaleDateString('fr-FR')
    }));
  }
};

module.exports = { getData };