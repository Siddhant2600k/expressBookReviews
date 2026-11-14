
const express = require('express');
const axios = require('axios');

let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    users.push({ username, password });
    return res.status(200).json({ message: 'User successfully registered' });
});

// Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/books-data');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving books' });
    }
});

// Internal endpoint for book data
public_users.get('/books-data', (req, res) => {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/books-data');
        const book = response.data[req.params.isbn];

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving book' });
    }
});

// Get books based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/books-data');
        const author = req.params.author.toLowerCase();

        const result = Object.values(response.data).filter(
            book => book.author.toLowerCase() === author
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving books' });
    }
});

// Get books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/books-data');
        const title = req.params.title.toLowerCase();

        const result = Object.values(response.data).filter(
            book => book.title.toLowerCase().includes(title)
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving books' });
    }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
