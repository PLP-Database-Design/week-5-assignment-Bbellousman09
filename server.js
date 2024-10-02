// Initialize dependencies / Variables   
const express = require('express');  
const app = express();  
const mysql = require('mysql2');  
const dotenv = require('dotenv');  
const cors = require('cors');  
const path = require('path'); // Import path module  

app.use(express.json());  
app.use(cors());  
dotenv.config();  

// Connect to the database  
const db = mysql.createConnection({  
    host: process.env.DB_HOST,  
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME  
});  

// Check if DB connection works  
db.connect((err) => {  
    if (err) {  
        return console.error("Error connecting to MySQL db:", err); // Improved error logging  
    }  
    
    console.log("Connected to MySQL successfully as id: ", db.threadId);  

    // Set the view engine to EJS  
    app.set('view engine', 'ejs');  

    // Set the views directory  
    app.set('views', path.join(__dirname, 'views')); // Correctly set the views directory  

    // 1. Retrieve all patients  
    app.get('/data', (req, res) => {  
        // Retrieve data from database  
        db.query('SELECT * FROM patients', (err, results) => {  
            if (err) {  
                console.error(err);  
                res.status(500).send('Error retrieving data');  
            } else {  
                // Render the EJS template with the results  
                res.render('data', { results: results });  
            }  
        });  
    });   

    // 2. Retrieve all providers and render in HTML table  
    app.get('/providers', (req, res) => {  
        const query = 'SELECT first_name, last_name, provider_specialty FROM providers';  
        db.query(query, (err, results) => {  
            if (err) {  
                console.error(err);  
                return res.status(500).send('Error retrieving providers data');  
            }  
            res.render('providers', { results: results }); // Render EJS template with the results  
        });  
    });     

    // 3. Filter patients by First Name and render the results in an HTML table  
    app.get('/patients/by-first-name/:firstName', (req, res) => {  
        const firstName = req.params.firstName;  
        const query = 'SELECT patient_id, first_name, last_name, date_of_birth FROM patients WHERE first_name = ?';  
        db.query(query, [firstName], (err, results) => {  
            if (err) {  
                console.error(err);  
                return res.status(500).send('Error retrieving patients data by name');  
            }  
            res.render('patients', { results: results }); // Render EJS template with the filtered results  
        });  
    });  

    // 4. Retrieve all providers by their specialty and render in an HTML table  
    app.get('/providers/by-specialty/:specialty', (req, res) => {  
        const specialty = req.params.specialty;  
        const query = 'SELECT first_name, last_name, provider_specialty FROM providers WHERE provider_specialty = ?';  
        db.query(query, [specialty], (err, results) => {  
            if (err) {  
                console.error(err);  
                return res.status(500).send('Error retrieving providers data by specialty');  
            }  
            res.render('providers', { results: results }); // Render EJS template with the filtered results  
        });  
    });  

    // Start the server  
    app.listen(process.env.PORT, () => {  
        console.log(`Server listening on port ${process.env.PORT}`);  

        // Send a message to the browser   
        app.get('/', (req, res) => {  
            res.send('Server started successfully! Wedding can go ON!!!');  
        });  
    });  
});  
