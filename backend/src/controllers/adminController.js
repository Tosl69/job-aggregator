const { getAllUsers, updateUserRole } = require('../models/userModel');
const { getWidgetInstances, deleteWidgetInstance } = require('../models/widgetModel');

const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getAllWidgets = async (req, res, next) => {
  try {
    const widgets = await getWidgetInstances();
    res.json(widgets);
  } catch (err) {
    next(err);
  }
};

const removeWidget = async (req, res, next) => {
  try {
    await deleteWidgetInstance(req.params.id);
    res.json({ message: 'Widget supprimé' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, updateRole, getAllWidgets, removeWidget };