// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuration from environment (override these in production) ---
const FULL_NAME = process.env.FULL_NAME || 'john doe';
const DOB = process.env.DOB || '17091999';            // ddmmyyyy
const EMAIL = process.env.EMAIL || 'john@xyz.com';
const ROLL_NUMBER = process.env.ROLL_NUMBER || 'ABCD123';

// --- Helpers ---
function makeUserId(fullName, dob) {
  // fullName -> lowercase, spaces -> underscores, remove non-letters/underscores
  const namePart = String(fullName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z_]/g, '');
  return `${namePart}_${dob}`;
}
function isDigitsOnly(s) { return /^\d+$/.test(s); }
function isAlphaOnly(s) { return /^[A-Za-z]+$/.test(s); }

// --- POST /bfhl ---
app.post('/bfhl', (req, res) => {
  try {
    const data = req.body && req.body.data;
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        user_id: makeUserId(FULL_NAME, DOB),
        email: EMAIL,
        roll_number: ROLL_NUMBER,
        odd_numbers: [],
        even_numbers: [],
        alphabets: [],
        special_characters: [],
        sum: "0",
        concat_string: "",
        error: "Invalid request: 'data' must be an array"
      });
    }

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sum = 0;
    const lettersSequence = []; // for concat_string

    for (let item of data) {
      // normalize to string
      const raw = item === null || item === undefined ? '' : String(item);
      const trimmed = raw.trim();

      // collect any letters inside this item for concat_string
      const letters = trimmed.match(/[A-Za-z]/g);
      if (letters) lettersSequence.push(...letters);

      if (isDigitsOnly(trimmed)) {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num)) {
          sum += num;
          if (num % 2 === 0) even_numbers.push(String(trimmed));
          else odd_numbers.push(String(trimmed));
        } else {
          special_characters.push(trimmed);
        }
      } else if (isAlphaOnly(trimmed)) {
        // element contains letters only -> add uppercase version to alphabets array
        alphabets.push(trimmed.toUpperCase());
      } else {
        // anything else (symbols, mixed strings) -> special_characters
        special_characters.push(trimmed);
      }
    }

    // concat_string: reverse the collected letters, then apply alternating caps:
    // starting with UPPER for the first character, then lower, then upper...
    const reversedLetters = lettersSequence.reverse();
    const concat_string = reversedLetters
      .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
      .join('');

    const response = {
      is_success: true,
      user_id: makeUserId(FULL_NAME, DOB),
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),       // sum must be a string
      concat_string
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      is_success: false,
      user_id: makeUserId(FULL_NAME, DOB),
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers: [],
      even_numbers: [],
      alphabets: [],
      special_characters: [],
      sum: "0",
      concat_string: "",
      error: "Internal server error"
    });
  }
});

// simple health route
app.get('/', (req, res) => res.send('bfhl API is running. POST /bfhl with { "data": [...] }'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
