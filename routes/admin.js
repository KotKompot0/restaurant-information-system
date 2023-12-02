var express = require('express');
var router = express.Router();
var connection = require("../models/createCon");


router.get('/admin', async function(req, res, next) {
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        let shifts = await connection.query("SELECT * FROM Shifts");
        let employees = await connection.query("SELECT * FROM Employees");
        let orders = await connection.query("SELECT * FROM Orders");
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const sqlShiftEmployee = `
        SELECT e.FullName, e.Role, s.ShiftName
        FROM Employees e
        INNER JOIN ShiftEmployee se ON e.EmployeeID = se.EmployeeID
        INNER JOIN Shifts s ON se.ShiftID = s.ShiftID
        WHERE s.StartDate <= '${now}' AND s.EndDate >= '${now}';
        `;
        let ShiftEmployee = await connection.query(sqlShiftEmployee);
        res.render('admin', { employees: employees, shifts: shifts, ShiftEmployee: ShiftEmployee, orders: orders });
    };
});

router.get('/add_employee', function(req, res, next) {
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        res.render('add_employee', { title: 'Express' });
    };
});

router.post("/add_employee", async function (req, res) {
    if(!req.body) return res.sendStatus(400);
    const {fullName, contactDetails, login, password, role} = req.body;
    await connection.query(`INSERT INTO Employees (FullName, ContactDetails, Login, Password, Role) VALUES ('${fullName}', '${contactDetails}', '${login}', '${password}', '${role}')`);
    res.redirect("/admin");
});

router.get("/edit_employee/:id", async function (req, res){
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        let id = req.params.id;
        let data = await connection.query(`SELECT * FROM Employees WHERE EmployeeID=${id}`);
        data = data.shift();
        res.render('edit_employee', { data: data });
    };
});

router.post("/edit_employee", async function (req, res){
    if(!req.body) return res.sendStatus(400);
    const {employeeID, fullName, contactDetails, login, role} = req.body;
    await connection.query(`UPDATE Employees SET FullName="${fullName}", ContactDetails="${contactDetails}", Login="${login}", Role="${role}" WHERE EmployeeID=${employeeID}`);
    res.redirect("/admin");
});

router.post("/del_employee", async function (req, res){
    if(!req.body) return res.sendStatus(400);
    const {employeeID} = req.body;
    await connection.query(`DELETE FROM Employees WHERE EmployeeID='${employeeID}'`);
    res.redirect("/admin");
});  

router.get("/add_to_shifts", async function (req, res){
    const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
        const employees = await connection.query('SELECT * FROM Employees');
        const shifts = await connection.query('SELECT * FROM Shifts');

        res.render("add_to_shifts", { employees, shifts });
    };
});   

router.post("/add_to_shifts", async function (req, res){
    if(!req.body) return res.sendStatus(400);
    let { employeeID, shiftID } = req.body;

    await connection.query(`INSERT INTO ShiftEmployee (EmployeeID, ShiftID) VALUES ('${employeeID}', '${shiftID}')`)

    res.redirect("/admin");
});

module.exports = router;
