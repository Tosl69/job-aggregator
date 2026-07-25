const services = require('../services');

const getServices = async (req, res, next) => {
  try {
    res.json(services.getAll());
  } catch (err) {
    next(err);
  }
};

const getServiceData = async (req, res, next) => {
  try {
    const { serviceId, widgetType } = req.params;
    const config = req.query;
    const data = await services.getData(serviceId, widgetType, config);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getServices, getServiceData };