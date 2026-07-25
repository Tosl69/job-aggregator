const { getWidgetInstancesByUser, createWidgetInstance, updateWidgetInstance, deleteWidgetInstance } = require('../models/widgetModel');

const getUserWidgets = async (req, res, next) => {
  try {
    const widgets = await getWidgetInstancesByUser(req.user.id);
    res.json(widgets);
  } catch (err) {
    next(err);
  }
};

const addWidget = async (req, res, next) => {
  try {
    const { serviceId, widgetType, config, refreshRate, position } = req.body;
    const widget = await createWidgetInstance(req.user.id, serviceId, widgetType, config, refreshRate, position);
    res.status(201).json(widget);
  } catch (err) {
    next(err);
  }
};

const editWidget = async (req, res, next) => {
  try {
    const { config, refreshRate, position } = req.body;
    const widget = await updateWidgetInstance(req.params.id, req.user.id, config, refreshRate, position);
    if (!widget) return res.status(404).json({ error: 'Widget non trouvé' });
    res.json(widget);
  } catch (err) {
    next(err);
  }
};

const removeWidget = async (req, res, next) => {
  try {
    await deleteWidgetInstance(req.params.id, req.user.id);
    res.json({ message: 'Widget supprimé' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserWidgets, addWidget, editWidget, removeWidget };