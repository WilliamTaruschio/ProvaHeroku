var express = require('express');
var router = express.Router();

var monGlo = require('../zzCustom/mongoGlobal');
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
/* HOME */


/* REGISTRAZIONE da sistemare, creare collections carrelli e sessione */
router.get('/registrazione', function (req, res) {
    res.render('registrazione.ejs',{errore: null});
});
router.post('/registrazione', function(req, res, next) {
    if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
        funzione(req, function(dati) {
            res.render('registrazione', { title: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
        });
    } else {
        console.log(req.body);
        funzione(req, function(dati) {
            monGlo.find('Utenti', {}, { codice: 1 }, function(data) {
                var newCode = 0;
                if (data.length != 0)
                    newCode = data[data.length - 1].codice + 1;
                monGlo.insert('Utenti', { codice: Number(newCode), nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password }, function(result) {
                    var query = { codice: Number(result[0].codice) };
                    monGlo.insert('Carrelli', { codice_utente: Number(result[0].codice), carrello: '[]' }, function(cartRes) {
                        var uid;
                        monGlo.find('Utenti', query, {}, function(data) {
                            if (data.length == 0) {
                                res.render('registrazione', { title: 'registrazione', contenuto: 'registrazione', menu: dati.menu, categorie: dati.categorie, menuattivo: null, errore: 'dati non corretti', auth: dati.logged });
                            } else {
                                uid = data[0]._id;
                                query = { codice: uid };
                                monGlo.find('Sessione', query, {}, function(data) {
                                    if (data.length == 0) {
                                        query = { codice: uid, stato: true };
                                        monGlo.insert('Sessione', query, function(data) {
                                            req.session.buser = data[0]._id;
                                            res.redirect('/');
                                        });
                                    } else {
                                        query = { codice: uid };
                                        monGlo.update('Sessione', query, { stato: false }, function(data) {
                                            query = { codice: uid, stato: true };
                                            monGlo.insert('Sessione', query, function(data) {
                                                req.session.buser = data[0]._id;
                                                res.redirect('/');
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    }
});
/* REGISTRAZIONE */

function funzione(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    monGlo.find('Prodotti', {}, { codice: 1 }, function (dati_collezione) {
        out.prodotti = dati_collezione;
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            monGlo.find('sessione', query, {}, function(data) {
                if (data.length != 0) {
                    out.userID = data[0].codice;
                    out.logged = true;
                }
                callback(out);
            });
        }
        callback(out);
    });
};
module.exports = router;