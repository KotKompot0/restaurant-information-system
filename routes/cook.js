var express = require('express');
var router = express.Router();
var connection = require("../models/createCon");

router.get('/cook', async function(req, res, next) {
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        let menu = await connection.query("SELECT * FROM Menu");
        let orders = await connection.query("SELECT * FROM Orders");
        res.render('cook', { menu, orders });
    };
});

router.get('/add_dish', async function(req, res, next) {
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        res.render('add_dish');
    };
});

router.post('/add_dish', async function(req, res, next) {
    if(!req.body) return res.sendStatus(400);
    let { dishName, price } = req.body;
    await connection.query(`INSERT INTO Menu (DishName, Price) VALUES ('${dishName}', '${price}');`);
    res.redirect('/cook');
});

router.get('/edit_dish/:id', async function(req, res, next) {
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        let id = req.params.id;
        let data = await connection.query(`SELECT * FROM Menu WHERE MenuItemID=${id}`);
        data = data.shift();
        res.render('edit_dish', { data: data });
    };
});

router.post('/edit_dish', async function(req, res, next){
    if(!req.body) return res.sendStatus(400);
    const {menuItemID, dishName, price} = req.body;
    await connection.query(`UPDATE Menu SET DishName="${dishName}", Price="${price}" WHERE MenuItemID=${menuItemID}`);
    res.redirect("/cook");
});

router.post("/del_dish", async function (req, res){
    if(!req.body) return res.sendStatus(400);
    const {menuItemID} = req.body;
    await connection.query(`DELETE FROM Menu WHERE MenuItemID=${menuItemID}`);
    res.redirect("/cook");
});

module.exports = router;
