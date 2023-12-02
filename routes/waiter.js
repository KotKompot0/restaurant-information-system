var express = require('express');
var router = express.Router();
var connection = require("../models/createCon");

router.get('/waiter', async function(req, res, next) {
    let menu = await connection.query("SELECT * FROM Menu");
    let orders = await connection.query("SELECT * FROM Orders");
    
    res.render('waiter', { menu, orders });
});

router.get('/add_order', async function(req, res, next) {
    const employees = await connection.query('SELECT * FROM Employees');
    const shifts = await connection.query('SELECT * FROM Shifts');
    const menuItems = await connection.query('SELECT * FROM Menu');
    res.render('add_order', { employees, shifts, menuItems });
});    

router.post('/add_order', async function(req, res, next) {
    try {
      const { userID, shiftID, ...orderItems } = req.body;
  
      const result = await connection.query(`INSERT INTO Orders (UserID, ShiftID, OrderStatus) VALUES (${userID}, ${shiftID}, 'В обработке')`);
  
      const orderID = result.insertId;
  
      const orderItemValues = [];

      Object.keys(orderItems).forEach(key => {
        const [prefix, index] = key.split('_');
        
        if (!orderItemValues[index]) {
          orderItemValues[index] = [];
        }

        if (prefix === 'menuItemID') {
          orderItemValues[index].unshift(orderID);
        }
        
        orderItemValues[index].push(orderItems[key]);
      });

      const valuesString = orderItemValues.map(item => `(${item.join(', ')})`).join(', ');

      await connection.query(`INSERT INTO OrderItem (OrderID, MenuItemID, Quantity) VALUES ${valuesString}`);
  
      res.redirect('/waiter');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});

router.get('/edit_order/:orderId', async function(req, res, next) {
  try {
    const orderId = req.params.orderId;

    // Получаем информацию о заказе и его позициях из базы данных
    const order = await connection.query('SELECT * FROM Orders WHERE OrderID = ?', [orderId]);
    const orderItems = await connection.query('SELECT * FROM OrderItem WHERE OrderID = ?', [orderId]);
    const menuItems = await connection.query('SELECT * FROM Menu');

    res.render('edit_order', { order: order[0], orderItems, menuItems });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/del_order_item', async function(req, res, next) {
  const { orderItemId } = req.body;
  await connection.query('DELETE FROM OrderItem WHERE OrderItemID = ?', [orderItemId]);
  res.send({ success: true });
});

router.post('/edit_order_item', async function(req, res, next) {
  const { orderItemID, orderID, menuItemID, quantity } = req.body;
  await connection.query(`UPDATE OrderItem SET MenuItemID=${menuItemID}, Quantity=${quantity} WHERE OrderItemID = ${orderItemID}`);
  res.redirect("/edit_order/" + orderID)
});

router.post('/edit_status_order', async function(req, res, next) {
    const {orderID, orderStatus} = req.body;
    await connection.query(`UPDATE Orders SET OrderStatus='${orderStatus}' WHERE OrderID = ${orderID}`);
    res.redirect("/edit_order/" + orderID)
});

router.post('/add_items_to_order', async function(req, res, next) {
  try {
    const { orderID, ...orderItems } = req.body;

    const orderItemValues = [];

    Object.keys(orderItems).forEach(key => {
      const [prefix, index] = key.split('_');
      
      if (!orderItemValues[index]) {
        orderItemValues[index] = [];
      }

      if (prefix === 'menuItemID') {
        orderItemValues[index].unshift(orderID);
      }
      
      orderItemValues[index].push(orderItems[key]);
    });

    const valuesString = orderItemValues.map(item => `(${item.join(', ')})`).join(', ');

    await connection.query(`INSERT INTO OrderItem (OrderID, MenuItemID, Quantity) VALUES ${valuesString}`);

    res.redirect("/edit_order/" + orderID)
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/del_order", async function(req, res, next) {
  const { orderID } = req.body;
  await connection.query('DELETE FROM Orders WHERE OrderID = ?', [orderID]);
  res.redirect('/waiter');
});

module.exports = router;
