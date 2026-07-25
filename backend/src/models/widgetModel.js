const pool = require('../db');

const getWidgetInstancesByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM widget_instances WHERE user_id = $1 ORDER BY position',
    [userId]
  );
  return result.rows;
};

const getWidgetInstances = async () => {
  const result = await pool.query('SELECT * FROM widget_instances ORDER BY created_at DESC');
  return result.rows;
};

const createWidgetInstance = async (userId, serviceId, widgetType, config, refreshRate, position) => {
  const result = await pool.query(
    'INSERT INTO widget_instances (user_id, service_id, widget_type, config, refresh_rate, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, serviceId, widgetType, JSON.stringify(config), refreshRate, position]
  );
  return result.rows[0];
};

const updateWidgetInstance = async (id, userId, config, refreshRate, position) => {
  const result = await pool.query(
    'UPDATE widget_instances SET config = $1, refresh_rate = $2, position = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
    [JSON.stringify(config), refreshRate, position, id, userId]
  );
  return result.rows[0];
};

const deleteWidgetInstance = async (id, userId) => {
  await pool.query(
    'DELETE FROM widget_instances WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
};

module.exports = { getWidgetInstancesByUser, getWidgetInstances, createWidgetInstance, updateWidgetInstance, deleteWidgetInstance };