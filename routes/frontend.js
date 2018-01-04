var express = require('express');
var router = express.Router();

var monGlo = require('C:/provaBootstrap/node_modules/zzCustom');
var ObjectID = require("mongodb").ObjectID;

/* HOME */

router.get('/', function (req, res) {
    funzione(req, function (dati) {
        console.log(dati);
        monGlo.find('Prodotti', {}, {}, function (search_result) {
            res.render('index', { title: 'home', prodotti: dati.prodotti });
        });
    });
});
/*
 
*/
router.get('/registrazione', function (req, res) {
    res.render('registrazione.ejs');
});

function funzione(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    monGlo.find('Prodotti', {}, { codice: 1 }, function (dati_collezione) {
        out.prodotti = dati_collezione;

        callback(out);
    });
};
module.exports = router;