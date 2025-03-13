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
        Booking_ExtraPaxFee
    } = req.body

    const sql = `INSERT INTO Booking (Booking_DateFrom, Booking_DateTo, Booking_Pax, Booking_Deposit, Unit_ID, Customer_ID, Agent_ID, Booking_Rate, Booking_Payment, Booking_ExtraPaxFee)
    VALUES (?, ?, ?, ?, ?, ?, ${Agent_ID ? '?' : 'NULL'}, ?, ?, ?)`

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
        Booking_ExtraPaxFee
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

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


