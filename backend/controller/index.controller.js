const e = require('express');


const index = (req, res) => {
    res.status(200).json({message: "Funcionando"})
}

module.exports = {
    index
}