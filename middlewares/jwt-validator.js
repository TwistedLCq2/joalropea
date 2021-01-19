const {request, response} = require('express');
const jwt = require('jsonwebtoken');


const jwtValidator = (req = request, res = response, next) => {

    //x-token Headers
    const token = req.header('x-token');
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        });
    }

    try {

        const {uid, name, role} = jwt.verify(
            token,
            'process.env.SECRET_JWT_SEED'
        );

        req.uid = uid;
        req.name = name;
        req.role = role;
        
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
    
    next();
}

module.exports = {
    jwtValidator
}