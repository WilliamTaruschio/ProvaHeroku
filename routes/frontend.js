var express = require('express');
var router = express.Router();

var monGlo = require('../zzCustom/mongoGlobal');
var ObjectID = require("mongodb").ObjectID;

/* HOME da sistemare*/

router.get('/', function (req, res,next) {
    funzione(req, function (dati) {
        console.log(dati);
        monGlo.find('Prodotti', {}, {}, function (search_result) {
            res.render('index', { title: 'home',contenuto:'prodotti', prodotti: dati.prodotti,auth: dati.logged });
        });
    });
});
router.post('/login', function(req, res, next) {
    funzione(req, function(dati) {
        var query = { email: req.body.login_email, password: req.body.login_password };
        console.log(query);
        console.log(req.body);
        var uid;
        monGlo.find('Utenti', query, {}, function(data) {
            console.log(data);
            if (data.length == 0) {
                res.redirect('/');
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
router.get('/logout', function(req, res, next) {
    funzione(req, function(dati) {
        var uid = req.session.buser;
        req.session.destroy();
        var query = { _id: ObjectID(uid) };
        monGlo.update('Sessione', query, { stato: false }, function(data) {
            monGlo.remove('Sessione', { stato: false }, function(data) {
                res.redirect('/');
            });
        });
    });
});
/* HOME */


/* REGISTRAZIONE da sistemare, creare collections carrelli e sessione */
router.get('/registrazione', function (req, res) {
    funzione(req, function(dati) {
        if (dati.logged == true)
        res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged });
        else
    res.render('index',{ title: 'registrazione' ,contenuto:'registrazione',errore: null,auth: dati.logged});
});
});
router.post('/registrazione', function(req, res, next) {
    if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
        funzione(req, function(dati) {
            res.render('index', { title: 'registrazione',contenuto:'registrazione',errore: 'dati non corretti', auth: dati.logged });
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
                                res.render('index', { title: 'registrazione',contenuto:'registrazione', errore: 'dati non corretti', auth: dati.logged });
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
/* PROFILO */
router.get('/profilo', function(req, res, next) {
    funzione(req, function(dati) {
        if (dati.logged == false)
            res.redirect('/');
        else {
            monGlo.find('Utenti', { _id: ObjectID(dati.userID) }, {}, function(found) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo',contenuto_sub: 'datiutente', auth: dati.logged, dati_utente: found[0] });
            });
        }
    });
});
router.get('/profilo/storicoordini', function(req, res, next) {
    funzione(req, function(dati) {
        if (dati.logged == false)
            res.redirect('/');
        res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'storicoordini'});
    });
});
/* PROFILO */

/* PRODOTTO */
router.get('/prodotto', function(req, res, next) {
    //Titolo = nome del prodotto
    var codice_prodotto = req.query.pro;
    console.log('codice del prodotto'+req.query.pro);
    var _id= (codice_prodotto);
    console.log('id  '+_id);
    funzione(req, function(dati) {
        monGlo.find('Prodotti', { _id:ObjectID(codice_prodotto) }, {}, function(dati_prodotto) {
                res.render('index', {
                    title: 'prodotto',
                    contenuto: 'prodotto',
                    dati_prodotto: dati_prodotto[0],
                    auth: dati.logged
                
            });
        });
    });
});
/* PRODOTTO */


function funzione(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    monGlo.find('Prodotti', {}, { codice: 1 }, function (dati_collezione) {
        out.prodotti = dati_collezione;
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            monGlo.find('Sessione', query, {}, function(data) {
                if (data.length != 0) {
                    out.userID = data[0].codice;
                    out.logged = true;
                }
                callback(out);
            });
        }else
        callback(out);
    });
};


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


router.get('/cerca',function(req,res,next){
    funzione(req, function (dati) {
if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    console.log('regex' + regex);
    monGlo.find('Prodotti',{nome:regex},{},function(dati_ricerca){
        console.log('prodotti ricercati: '+ dati_ricerca[0]);
        res.render('index', { title: 'home',contenuto:'prodotti', prodotti: dati_ricerca ,auth: dati.logged });
        

    });
}

});
});

/* CATEGORIA */
router.get('/categoria',function(req,res,next){
    
        var categoria_prodotto = req.query.cat;
        console.log('categoria del prodotto'+req.query.cat);
        funzione(req, function(dati) {
            monGlo.find('Prodotti', { categoria:categoria_prodotto }, {}, function(dati_prodotto) {
                console.log(dati_prodotto[0]);
                    res.render('index', {
                        title: 'prodotto',
                        contenuto: 'prodotti',
                        prodotti: dati_prodotto,
                        auth: dati.logged
                    });
                });
            });
});



module.exports = router;