const { request, response } = require('express');
const Customer = require('../models/Customer');
const { msgError } = require('./products');

const createCustomer = async (req = request, res = response) => {
  const { code, name } = req.body;

  try {
    let customer = await Customer.findOne({ code });

    if (customer) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe el cliente: ${name}`,
        result: [],
      });
    } else {
      customer = new Customer(req.body);
      await customer.save();
      return res.status(201).json({
        ok: true,
        msg: 'Customer created',
        result: customer,
      });
    }
  } catch (error) {
    msgError(res, error);
  }
};

const getCustomers = async (req = request, res = response) => {
  try {
    const customers = await Customer.find();

    if (customers) {
      res.status(200).json({
        ok: true,
        msg: 'Get customers',
        result: customers,
      });
    }
  } catch (error) {
    msgError(req, error);
  }
};

const getCustomerById = async (req = request, res = response) => {
  try {
    const foundCustomer = await Customer.findById(req.params.id);
    if (!foundCustomer) {
      return res.status(404).json({
        ok: false,
        msg: `There is no customer with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      ok: true,
      msg: 'Customer got by id',
      result: foundCustomer,
    });
  } catch (error) {
    msgError(res, error);
  }
};

const getCustomerByCode = async (req = request, res = response) => {
  const code = req.params.code.toUpperCase();

  try {
    let foundCustomers = await Customer.find(
      { code: { $regex: `^${code}` } },
      { _id: 1, code: 1, name: 1 }
    ).limit(10);

    if (foundCustomers.length === 0) {
      foundCustomers = await Customer.find(
        { name: { $regex: new RegExp(code, 'i') } },
        { _id: 1, code: 1, name: 1 }
      ).limit(10);
    }

    if (foundCustomers.length === 0) {
      foundCustomers = [];
    }

    res.status(200).json({
      ok: true,
      msg: 'Customer got by code',
      result: foundCustomers,
    });
  } catch (error) {
    msgError(res, error);
  }
};

const updateCustomer = async (req = request, res = response) => {
  try {
    const foundCustomer = await Customer.findById(req.params.id);
    if (!foundCustomer) {
      return res.status(404).json({
        ok: false,
        msg: `There is no customer with id: ${req.params.id}`,
      });
    }

    const newData = { ...req.body };
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      newData,
      { new: true }
    );

    res.status(200).json({
      ok: true,
      msg: 'Updated customer',
      result: updatedCustomer,
    });
  } catch (error) {
    msgError(res, error);
  }
};

const deleteCustomer = async (req = request, res = response) => {
  try {
    const foundCustomer = await Customer.findById(req.params.id);
    if (!foundCustomer) {
      return res.status(404).json({
        ok: false,
        msg: `There is no customer with id: ${req.params.id}`,
      });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({
      ok: true,
      msg: `customer ${foundCustomer.name} removed`,
    });
  } catch (error) {
    msgError(res, error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerByCode,
  updateCustomer,
  deleteCustomer,
};
