const { request, response } = require('express');
const Sale = require('../models/Sale');
const { msgError } = require('./products');

const getSales = async (_, res = response) => {
  try {
    const sales = await Sale.find().sort({ invoiceNumber: -1 });

    res.status(200).json({
      ok: true,
      msg: 'Get sales',
      result: sales,
    });
  } catch (error) {
    msgError(res, error);
  }
};

const createSale = async (req = request, res = response) => {
  const newSale = new Sale(req.body);
  const { invoiceNumber, customer } = newSale;

  try {
    const curSale = await Sale.findOne({ invoiceNumber });
    if (curSale) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe la Venta: ${invoiceNumber} al cliente ${customer.name}`,
      });
    } else {
      const savedSale = await newSale.save();
      res.status(201).json({
        ok: true,
        msg: 'Sale created',
        result: savedSale,
      });
    }
  } catch (error) {
    msgError(res, error);
  }
};

const updateSale = async (req = request, res = response) => {
  try {
    const curSale = await Sale.findById(req.params.id);
    if (!curSale) {
      return res.status(404).json({
        ok: false,
        msg: `There is no sale with id: ${req.params.id}`,
      });
    }
    const newData = { ...req.body };
    const updatedSale = await Sale.findByIdAndUpdate(req.params.id, newData, {
      new: true,
    });
    res.status(201).json({
      ok: true,
      msg: 'Updated sale',
      result: updatedSale,
    });
  } catch (error) {
    msgError(res, error);
  }
};

const deleteSale = async (req = request, res = response) => {
  try {
    const curSale = await Sale.findById(req.params.id);
    if (!curSale) {
      return res.status(404).json({
        ok: false,
        msg: `There is no sale with id: ${req.params.id}`,
      });
    }
    await Sale.findByIdAndDelete(req.params.id);
    res.status(201).json({
      ok: true,
      msg: 'sale removed',
    });
  } catch (error) {
    msgError(res, error);
  }
};

const getSaleById = async (req = request, res = response) => {
  try {
    const curSale = await Sale.findById(req.params.id);
    if (!curSale) {
      return res.status(404).json({
        ok: false,
        msg: `There is no sale with id: ${req.params.id}`,
      });
    }
    res.status(201).json({
      ok: true,
      msg: 'Sale got by id',
      result: curSale,
    });
  } catch (error) {
    msgError(res, error);
  }
};

const getSaleByCode = async (req = request, res = response) => {
  const code = req.params.code;
  try {
    const curSale = await Sale.find(
      { code: { $regex: `^${code}` } },
      { _id: 1, code: 1, customer: 1 }
    ).limit(10);
    if (!curSale) {
      return res.status(404).json({
        ok: false,
        msg: `There is no sale with code: ${code}`,
      });
    }
    res.status(200).json({
      ok: true,
      msg: 'Sale got by code',
      result: curSale,
    });
  } catch (error) {
    msgError(res, error);
  }
};

module.exports = {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  getSaleById,
  getSaleByCode,
};
