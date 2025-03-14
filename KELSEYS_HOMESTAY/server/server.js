const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../assets')));

// Route to serve index.html
app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/properties', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/properties.html'));
});
app.get('/customers', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/customer.html'));
});
app.get('/agents', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/agent.html'));
});
app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/expenses.html'));
});

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Kelseys_Homestay',
    port: '3306'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

//REQUESTS FOR HOMEPAGE - START

app.get('/api/customers/id', (req, res) => {
    const { name, email } = req.query;

    const sql = `SELECT Customer_ID FROM Customer WHERE Customer_Name = ? AND Customer_Email = ?`;

    db.query(sql, [name, email], (err, results) => {
        if (err) {
            console.error('Error fetching customer ID:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ customerID: results[0].Customer_ID });
    });
});


//fetch booking table
app.get('/api/bookings', (req, res) => {
    const sql = `
        SELECT 
            b.Booking_ID, 
            b.Booking_DateFrom, 
            b.Booking_DateTo, 
            u.Unit_Name, 
            c.Customer_Name, 
            a.Agent_Name, 
            b.Booking_Pax, 
            b.Booking_Deposit, 
            b.Booking_Payment, 
            b.Booking_Commission, 
            b.Booking_Rate, 
            b.Booking_ExtraPaxFee,
            ((DATEDIFF(b.Booking_DateTo, b.Booking_DateFrom) * b.Booking_Rate) + COALESCE(b.Booking_ExtraPaxFee, 0)) AS total
        FROM Booking b
        LEFT JOIN Unit u ON b.Unit_ID = u.Unit_ID
        LEFT JOIN Customer c ON b.Customer_ID = c.Customer_ID
        LEFT JOIN Agent a ON b.Agent_ID = a.Agent_ID;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

//fetch unit drop down values
app.get('/api/units', (req, res) => {
    const sql = `
        SELECT 
            u.Unit_ID, 
            u.Unit_Name, 
            p.Property_Name
        FROM Unit u
        JOIN Building b ON u.Building_ID = b.Building_ID
        JOIN Property p ON b.Property_ID = p.Property_ID
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching units:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Fetch unit details by Unit_ID
app.get('/api/bookings/units', (req,res) => {
    const sql = `SELECT Unit_ID, Unit_Price, Unit_Pax, Unit_ExtraPaxFee FROM Unit`

    db.query(sql, (err,results)=> {
        if(err) {
            console.error('Error fetching unit details:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results);
    })
});

app.get('/api/check/customer', (req,res)=> {
    const sql = `SELECT Customer_ID, Customer_Name, Customer_Email FROM Customer`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching Customer Details: ',err);
            return res.status(500).json({error: 'Database Error'});
        }
        res.json(results);
    });
});

app.get('/api/check/agent', (req,res)=> {
    const sql = `SELECT Agent_ID, Agent_Name, Agent_Email FROM Agent`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching Agent Details: ',err);
            return res.status(500).json({error: 'Database Error'});
        }
        res.json(results);
    })
});

app.get('/api/check/dates', (req,res)=> {
    const sql = `SELECT Booking_DateFrom, Booking_DateTo, Unit_ID FROM Booking`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching Booking Dates: ',err);
            return res.status(500).json({error: 'Database Error'});
        }
        res.json(results);
    });
});

app.get('/api/calendar/dates', (req,res)=> {
    const sql = `SELECT Booking_DateFrom, Booking_DateTo Unit_ID FROM Booking`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching Booking Dates: ',err);
            return res.status(500).json({error: 'Database Error'});
        }
        res.json(results);
    });
});

// Create a booking
app.post('/api/bookings/post',(req,res) =>{
    const {
        Booking_DateFrom,
        Booking_DateTo,
        Booking_Pax,
        Booking_Deposit,
        Unit_ID,
        Customer_ID,
        Agent_ID,
        Booking_Rate,
        Booking_Payment,
        Booking_ExtraPaxFee,
        Booking_Commission
    } = req.body

    const sql = `INSERT INTO Booking (Booking_DateFrom, Booking_DateTo, Booking_Pax, Booking_Deposit, Unit_ID, Customer_ID, Agent_ID, Booking_Rate, Booking_Payment, Booking_ExtraPaxFee, Booking_Commission)
    VALUES (?, ?, ?, ?, ?, ?, ${Agent_ID ? '?' : 'NULL'}, ?, ?, ?, ${Booking_Commission ? '?' : 'NULL'})`

    const values = [
        Booking_DateFrom,
        Booking_DateTo,
        Booking_Pax,
        Booking_Deposit,
        Unit_ID,
        Customer_ID,
        ...(Agent_ID ? [Agent_ID] : []),
        Booking_Rate,
        Booking_Payment,
        Booking_ExtraPaxFee,
        ...(Booking_Commission ? [Booking_Commission] : [])
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating booking: ', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.status(201).json({message: 'Booking Added Successfully.'});
    });
});

app.post('/api/bookings/customer', (req,res) => {
    const {
        customer_Name,
        customer_Email,
        customer_ContactNum,
        customer_BirthDate
    } = req.body;
    const sql = `INSERT INTO Customer (Customer_Name, Customer_Email, Customer_ContactNum, Customer_BirthDate)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [customer_Name, customer_Email, customer_ContactNum, customer_BirthDate], (err, result) => {
        if (err) {
            console.error('Error inserting customer:', err);
            return res.status(500).json({ error: 'Database error: Insert customer' });
        }
        res.status(201).json({message: 'Customer Added Successfully.'});
    });
});

app.post('/api/bookings/agent', (req,res) => {
    const {
        agent_Name,
        agent_Email,
        agent_ContactNum
    } = req.body;

    const sql = `INSERT INTO Agent (agent_name, agent_email, agent_contactnum)
    VALUES (?, ?, ?)`;

    db.query(sql, [agent_Name, agent_Email, agent_ContactNum], (err, result)=> {
        if (err) {
            console.error('Error inserting agent:', err);
            return res.status(500).json({ error: 'Database error: Insert agent' });
        }
        res.status(201).json({message: 'Agent Added Successfully.'});
    });
});

app.put('/api/booking/update/:BookingID', (req, res) => {
    const { BookingID } = req.params;
    const {
        Booking_DateFrom,
        Booking_DateTo,
        Booking_Pax,
        Booking_Deposit,
        Unit_ID,
        Customer_ID,
        Agent_ID,
        Booking_Rate,
        Booking_Payment,
        Booking_ExtraPaxFee,
        Booking_Commission
    } = req.body;

    // SQL query to update booking details
    const sql = `
        UPDATE Booking 
        SET Booking_DateFrom = ?,
            Booking_DateTo = ?,
            Booking_Pax = ?,
            Booking_Deposit = ?,
            Unit_ID = ?,
            Customer_ID = ?,
            Agent_ID = ?,
            Booking_Rate = ?,
            Booking_Payment = ?,
            Booking_ExtraPaxFee = ?,
            Booking_Commission = ?
        WHERE Booking_ID = ?`;

    db.query(sql, [
        Booking_DateFrom,
        Booking_DateTo,
        Booking_Pax,
        Booking_Deposit,
        Unit_ID,
        Customer_ID,
        Agent_ID,
        Booking_Rate,
        Booking_Payment,
        Booking_ExtraPaxFee,
        Booking_Commission,
        BookingID
    ], (err, result) => {
        if (err) {
            console.error("Error updating booking:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ message: "Booking updated successfully" });
    });
});


//REQUESTS FOR HOMEPAGE - END

//REQUESTS FOR PROPERTIES - START

app.get('/api/properties/units', (req,res) => {
    const sql = `SELECT * FROM Unit`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching units:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/properties/buildings',(req,res) => {
    const sql = `SELECT * FROM Building`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching buildings:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/properties/property',(req,res) => {
    const sql = `SELECT * FROM Property`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching properties:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/properties/property/post',(req,res)=> {
    const {
        Property_Name,
        Property_Address
    } = req.body;

    const sql = `INSERT INTO Property (Property_Name, Property_Address) VALUES (?,?)`;

    db.query(sql, [Property_Name,Property_Address], (err, result) => {
        if (err) {
            console.error('Error inserting property:', err);
            return res.status(500).json({ error: 'Database error: Insert property' });
        }
        res.status(201).json({message: 'Property Added Successfully.'});
    });
});

app.post('/api/properties/buildings/post',(req,res)=> {
    const {
        Property_ID,
        Building_Tower,
        Building_Floor
    } = req.body;

    const sql = `INSERT INTO Building (Property_ID, Building_Tower, Building_Floor) VALUES (?,?,?)`;

    db.query(sql, [Property_ID,Building_Tower,Building_Floor], (err, result) => {
        if (err) {
            console.error('Error inserting building:', err);
            return res.status(500).json({ error: 'Database error: Insert building' });
        }
        res.status(201).json({message: 'building Added Successfully.'});
    });
});

app.post('/api/properties/units/post',(req,res)=> {
    const {
        Unit_Name,
        Unit_Pax,
        Unit_Price,
        Unit_ExtraPaxFee,
        Unit_Size,
        Unit_Desc,
        Building_ID
    } = req.body;

    const sql = `INSERT INTO Unit (Unit_Name, Unit_Pax, Unit_Price, Unit_ExtraPaxFee, Unit_Size, Unit_Desc, Building_ID) 
    VALUES (?,?,?,?,?,?,?)`;

    db.query(sql, [Unit_Name,Unit_Pax,Unit_Price,Unit_ExtraPaxFee,Unit_Size,Unit_Desc,Building_ID], (err, result) => {
        if (err) {
            console.error('Error inserting unit:', err);
            return res.status(500).json({ error: 'Database error: Insert unit' });
        }
        res.status(201).json({message: 'Property Added Successfully.'});
    });
});
app.get('/api/properties/propertyid',(req,res) => {
    const {name, address} = req.query;

    const sql = `SELECT Property_ID FROM Property WHERE Property_Name = ? AND Property_Address = ?`;

    db.query(sql, [name, address], (err, results) => {
        if (err) {
            console.error('Error fetching Property ID:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json({ propertyID: results[0].Property_ID });
    });
});

//CUSTOMERS PAGE

app.get('/api/customers/table', (req,res) => {
    const sql = `SELECT * FROM Customer`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.put('/api/customers/update/:customerID', (req, res) => {
    const { customerID } = req.params;
    const { customer_Name, customer_Email, customer_ContactNum, customer_BirthDate } = req.body;

    const sql = `UPDATE Customer SET Customer_Name = ?, Customer_Email = ?, Customer_ContactNum = ?, Customer_BirthDate = ? WHERE Customer_ID = ?`;

    db.query(sql, [customer_Name, customer_Email, customer_ContactNum, customer_BirthDate, customerID], (err, result) => {
        if (err) {
            console.error("Error updating customer:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Customer updated successfully" });
    });
});

app.delete('/api/customers/delete/:customerID', (req, res) => {
    const { customerID } = req.params;

    const sql = `DELETE FROM Customer WHERE Customer_ID = ?`;

    db.query(sql, [customerID], (err, result) => {
        if (err) {
            console.error("Error deleting customer:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Customer deleted successfully" });
    });
});

// AGENTS

app.get('/api/agents/table', (req,res) => {
    const sql = `SELECT * FROM Agent`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching agents:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.put('/api/agents/update/:agentID', (req, res) => {
    const { agentID } = req.params;
    const { agent_Name, agent_Email, agent_ContactNum} = req.body;

    const sql = `UPDATE Agent SET Agent_Name = ?, Agent_Email = ?, Agent_ContactNum = ? WHERE Agent_ID = ?`;

    db.query(sql, [agent_Name, agent_Email, agent_ContactNum, agentID], (err, result) => {
        if (err) {
            console.error("Error updating agent:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Agent updated successfully" });
    });
});

app.delete('/api/agent/delete/:agentID', (req, res) => {
    const { agentID } = req.params;

    const sql = `DELETE FROM Customer WHERE Customer_ID = ?`;

    db.query(sql, [agentID], (err, result) => {
        if (err) {
            console.error("Error deleting agent:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Agent deleted successfully" });
    });
});

// EXPENSES

app.get('/api/bills', (req,res) => {
    const sql = `SELECT * FROM Bills`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results);
    });
});

app.get('/api/expenses', (req,res) => {
    const sql = `SELECT * FROM Expenses`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results);
    });
});

app.get('/api/dailyexpenses', (req,res) => {
    const sql = `SELECT * FROM Daily_Expenses`;

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching daily expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results);
    });
});

app.get('/api/dailyexpenses/last', (req,res) => {
    const sql = `SELECT * FROM Daily_Expenses ORDER BY Daily_ID DESC LIMIT 1;`

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching daily expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results);
    });
});

app.get('/api/bills/last', (req,res) => {
    const sql = `SELECT * FROM Bills ORDER BY Bills_ID DESC LIMIT 1;`

    db.query(sql, (err, results)=> {
        if (err) {
            console.error('Error fetching daily expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results);
    });
});

app.post('/api/dailyexpenses/post', (req,res) => {
    const {
        Unit_ID,
        Daily_Date,
        Daily_CostName,
        Daily_Cost
    } = req.body;

    const sql=`INSERT INTO Daily_Expenses(Unit_ID, Daily_Date, Daily_CostName, Daily_Cost)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [Unit_ID, Daily_Date, Daily_CostName, Daily_Cost], (err, results)=> {
        if (err) {
            console.error('Error posting daily expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.status(201).json({message: 'Daily Expenses submitted.'});
    });

});

app.post('/api/expenses/postde', (req,res) => {
    const {
        Unit_ID,
        Daily_ID,
        Cost,
    } = req.body;

    const sql=`INSERT INTO Expenses(Unit_ID, Daily_ID, Exp_TotalCost) VALUES (?,?,?)`;

    db.query(sql, [Unit_ID, Daily_ID, Cost], (err, results) => {
        if (err) {
            console.error('Error posting expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.status(201).json({message: 'Expenses submitted'});
    });
});

app.post('/api/expenses/postbills', (req,res) => {
    const {
        Unit_ID,
        Bills_ID,
        Cost,
    } = req.body;

    const sql=`INSERT INTO Expenses(Unit_ID, Bills_ID, Exp_TotalCost) VALUES (?,?,?)`;

    db.query(sql, [Unit_ID, Bills_ID, Cost], (err, results) => {
        if (err) {
            console.error('Error posting expenses:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.status(201).json({message: 'Expenses submitted'});
    });
});

app.post('/api/bills/post', (req,res)=> {
    const {
        Bills_Name,
        Bills_Date,
        Unit_ID,
        Bills_Cost
    } = req.body;

    const sql = `INSERT INTO Bills(Unit_ID, Bills_Name, Bills_Date, Bills_Cost) VALUES (?,?,?,?)`;

    db.query(sql, [Unit_ID, Bills_Name, Bills_Date, Bills_Cost], (err, reulsts) => {
        if (err) {
            console.error('Error posting bills:', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.status(201).json({message: 'Expenses submitted'});
    });
});

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


