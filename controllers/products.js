const {request, response} = require('express');
const Product = require('../models/Product');
const {Roles} = require('../helper/roles');

/**
 * MongoDB Database model structure
 * {
 *      "id": "5f9c3df4b77fe909bd6feb61",
 *      "code": "P551712",
 *      "category": "FILTER",
 *      "title": "FUEL-FILTER",
 *      "info": [
 *          {
 *              "trademark": "DONALDSON",
 *              "loc_qty": [
 *                  {
 *                      "location": "RACK-04-D3",
 *                      "qty": 38
 *                  }
 *              ],
 *              "costPrice": 7.036005,
 *              "salePrice": 22
 *          }
 *      ],
 *      "replacement": ["CAT: 1R0121", "OTHER: 1935274"],
 *      "measurement": "2 1/2\"",
 *      "status": "USADO"
 *  }
*/

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *
 * Path: "/"
 * Method: GET
 * Controller that gets the data for all inventory products.
 */
const getProducts = async (req = request, res = response ) => {

    try {
        const products = await Product.find();
        
        res.json({
            ok: true,
            msg: 'Get products',
            result: products
        });

    } catch (error) {
        msgError(res, error);
    }
}

/**
 * 
 * @param {data} req.body
 * The information about the new product comes on body of request
 * and must have the structure of the model.
 * 
 * Path: "/"
 * Method: POST
 * Controller to create a new product whose code does not exist,
 * if the code exists but not the trademark is adds the new info in that code,
 * if the trademark exists, a new loc_qty is added.
 */
const createProduct = async (req = request, res = response ) => {

    const newProduct = new Product(req.body);
    const {code, info} = req.body;
    const {trademark, loc_qty} = info[0];
    const {location} = loc_qty[0];

    let savedProduct;

    try {
        const productDB = await Product.findOne({code})
        
        if (productDB) {    

            const trademarksAvailable = await Product.find({code}).distinct('info.trademark');

            if (trademarksAvailable.includes(trademark)) {

                savedProduct = await Product.updateOne({code}, {
                    $push: {
                        'info.$[inf].loc_qty': loc_qty
                    }}, {
                        arrayFilters: [{'inf.trademark': trademark}]
                    });  

                    res.json({
                        ok: true,
                        msg: `Created the new location ${location} of the product with code: ${code}`,
                        result: savedProduct
                    });

            } else {

                savedProduct = await Product.updateOne({code}, {
                    $push: {
                        'info': info
                    }
                });

                res.json({
                    ok: true,
                    msg: `The product's ${trademark} trademark was created in the code: ${code}`,
                    result: savedProduct
                });
            }


        } else {

            savedProduct = await newProduct.save()
    
            res.json({
                ok: true,
                msg: 'Product created',
                result: savedProduct
            });  
        };

    } catch (error) {
        msgError(res, error);
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * Path: "/:id"
 * Method: GET
 * controller that updates all or part of the information of a spare part. 
 */
const updateProduct = async (req = request, res = response ) => {

    try {
        const curProduct = await Product.findById(req.params.id);

        if (!curProduct) {
            return res.status(404).json({
                ok: false,
                msg: `There is no product with id: ${req.params.id}`
            });
        }

        /* if (part.user.toString() !== req.uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegios para editar este repuesto'
            });
        } */

        const newData = {
            ...req.body
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, newData, {new: true});

        res.json({
            // '/123456'
            ok: true,
            msg: 'Updated product',
            result: updatedProduct
        });

    } catch (error) {
        msgError(error);
    }
}


const updateQtyProduct = async (req = request, res = response ) => {
    
    try {

        const {code, trademark, location, qty} = req.body;
        const curProduct = await Product.findOne({code});

        if (!curProduct) {
            return res.status(404).json({
                ok: false,
                msg: `There is no product with code: ${code}`
            });
        }

        const updatedQty = await Product.updateOne({code},
                                                   {$inc: {'info.$[inf].loc_qty.$[loc].qty': qty}},
                                                   {arrayFilters: [{'inf.trademark': trademark}, {'loc.location': location}]}
        );    

        res.json({
            // '/123456'
            ok: true,
            msg: 'Updated product quantity',
            result: updatedQty
        });

    } catch (error) {
        msgError(error);
    }
}


const deleteProduct = async (req = request, res = response ) => {

    try {
        const curProduct = await Product.findById(req.params.id);

        if (!curProduct) {
            return res.status(404).json({
                ok: false,
                msg: `There is no product with id: ${req.params.id}`
            });
        }

        /* if (part.user.toString() !== req.uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegios para Eliminar este evento'
            });
        } */

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            // '/123456'
            ok: true,
            msg: 'product removed'
        });

    } catch (error) {
        msgError(error);
    }
}


const getProductById = async (req = request, res = response ) => {

    try {
        const curProduct = await Product.findById(req.params.id);

        if (!curProduct) {
            return res.status(404).json({
                ok: false,
                msg: `There is no product with id: ${req.params.id}`
            });
        }

        res.json({
            // '/123456'
            ok: true,
            msg: 'Product geted by id',
            result: curProduct
        });

    } catch (error) {
        msgError(error);
    }
}


const getProductByCode = async (req = request, res = response ) => {

    const code = req.params.code;
    const mode = req.header('x-mode');
    const field = JSON.parse(`{\"${mode}\": 1, \"_id\": 0}`);

    try {
        const curProduct = await Product.find({code: { $regex: `^${code}`}}, (!!mode) ? field : {});

        if (!curProduct) {
            return res.status(404).json({
                ok: false,
                msg: `There is no product with code: ${code}`
            });
        }

        res.json({
            ok: true,
            msg: 'Product geted by code',
            result: curProduct
        });

    } catch (error) {
        msgError(error);
    }
}


const msgError = (res, err) => {
    console.log(err);
    res.status(500).json({
        ok: false,
        msg: 'Please, talk to the administrator'
    });
}

module.exports = {
    createProduct,
    deleteProduct,
    getProducts,
    getProductById,
    getProductByCode,
    updateProduct,
    updateQtyProduct
}
