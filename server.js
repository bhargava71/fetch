const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Use dynamic import for the 'open' package
import('open').then(open => {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    const dataFilePath = './students.json';

    // Helper function to read data from the JSON file
    const readData = () => {
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath);
            return JSON.parse(data);
        } else {
            return [];
        }
    };

    // Helper function to write data to the JSON file
    const writeData = (data) => {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    };

    // Serve static files (like your HTML)
    app.use(express.static(path.join(__dirname, 'public')));

    // API endpoints

    // Get all students
    app.get('/api/students', (req, res) => {
        const students = readData();
        res.json(students);
    });

    // Add a new student
    app.post('/api/students', (req, res) => {
        const students = readData();
        const newStudent = { id: students.length + 1, ...req.body };
        students.push(newStudent);
        writeData(students);
        res.status(201).json(newStudent);
    });

    // Update a student by ID
    app.put('/api/students/:id', (req, res) => {
        const students = readData();
        const { id } = req.params;
        const { name, course } = req.body;
        const studentIndex = students.findIndex(student => student.id == id);

        if (studentIndex !== -1) {
            students[studentIndex].name = name;
            students[studentIndex].course = course;
            writeData(students);
            res.json(students[studentIndex]);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    });

    // Delete a student by ID
    app.delete('/api/students/:id', (req, res) => {
        const students = readData();
        const { id } = req.params;
        const newStudents = students.filter(student => student.id != id);
        writeData(newStudents);
        res.status(204).end();
    });

    // Handle the root URL (optional)
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        open.default(`http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to import open package:', err);
});
