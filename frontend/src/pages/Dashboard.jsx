import { useState, useEffect, useCallback } from 'react';
import { getWidgets, updateWidget } from '../services/api';
import Navbar from '../components/Navbar';
import Widget from '../components/Widget';
import AddWidgetModal from '../components/AddWidgetModal';
import EditWidgetModal from '../components/EditWidgetModal';
import GridLayout from 'react-grid-layout';

export default function Dashboard({ user, setUser, setPage }) {
  const [widgets, setWidgets] = useState([]);
  const [layout, setLayout] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editWidget, setEditWidget] = useState(null);
  const [width, setWidth] = useState(window.innerWidth - 48);

  useEffect(() => {
    const init = async () => {
      const data = await getWidgets();
      const sorted = data.sort((a, b) => a.position - b.position);
      setWidgets(sorted);
      let x = 0, y = 0;
      const initialLayout = sorted.map(w => {
        const config = typeof w.config === 'string' ? JSON.parse(w.config) : w.config;
        const saved = config._layout;
        if (saved) return { i: w.id, x: saved.x, y: saved.y, w: saved.w, h: saved.h, minW: 2, minH: 2 };
        if (x + 4 > 12) { x = 0; y += 4; }
        const item = { i: w.id, x, y, w: 4, h: 4, minW: 2, minH: 2 };
        x += 4;
        return item;
      });
      setLayout(initialLayout);
    };
    init();
    const handleResize = () => setWidth(window.innerWidth - 48);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWidgets = async () => {
    const data = await getWidgets();
    const sorted = data.sort((a, b) => a.position - b.position);
    setWidgets(prev => {
      setLayout(prevLayout => {
        const existingIds = new Set(prevLayout.map(l => l.i));
        let x = 0;
        let y = prevLayout.length > 0 ? Math.max(...prevLayout.map(l => l.y + l.h)) : 0;
        const newItems = sorted
          .filter(w => !existingIds.has(w.id))
          .map(w => {
            if (x + 4 > 12) { x = 0; y += 4; }
            const item = { i: w.id, x, y, w: 4, h: 4, minW: 2, minH: 2 };
            x += 4;
            return item;
          });
        return [...prevLayout, ...newItems];
      });
      return sorted;
    });
  };

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
    newLayout.forEach(item => {
      const widget = widgets.find(w => w.id === item.i);
      if (widget) {
        const config = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
        updateWidget(widget.id, {
          config: { ...config, _layout: { x: item.x, y: item.y, w: item.w, h: item.h } },
          refreshRate: widget.refresh_rate,
          position: item.x + item.y * 12
        });
      }
    });
  }, [widgets]);

  const handleDelete = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setLayout(prev => prev.filter(l => l.i !== id));
  };

  return (
    <div className="min-h-screen bg-gray-700">
      <Navbar user={user} setUser={setUser} setShowModal={setShowModal} setPage={setPage} />
      <div className="p-6 pb-96">
        {widgets.length === 0 ? (
          <div className="text-center mt-24">
            <p className="text-white text-xl font-semibold mb-2">Votre dashboard est vide</p>
            <p className="text-gray-300 mb-6">Ajoutez des widgets pour suivre le marché crypto en temps réel</p>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
              + Ajouter un widget
            </button>
          </div>
        ) : (
          <GridLayout
            layout={layout}
            cols={12}
            rowHeight={80}
            width={width}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            margin={[12, 12]}
            compactType={null}
            isResizable={true}
            isDraggable={true}
            autoSize={true}
            resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
          >
            {widgets.map(w => (
              <div key={w.id} style={{ overflow: 'hidden' }}>
                <Widget widget={w} onDelete={handleDelete} onEdit={() => setEditWidget(w)} />
              </div>
            ))}
          </GridLayout>
        )}
      </div>
      {showModal && <AddWidgetModal onClose={() => setShowModal(false)} onAdd={fetchWidgets} />}
      {editWidget && <EditWidgetModal widget={editWidget} onClose={() => setEditWidget(null)} onSave={fetchWidgets} />}
    </div>
  );
}