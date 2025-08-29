const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Personal details
const USER_DETAILS = {
    user_id: "keerthana_arun_280804", 
    email: "keerthana.arun2022@vitstudent.ac.in",      
    roll_number: "22BDS0041"    
};

// Helper function to process data
function processData(dataArray) {
    const result = {
        is_success: true,
        ...USER_DETAILS,
        odd_numbers: [],
        even_numbers: [],
        alphabets: [],
        special_characters: [],
        sum: "0",
        concat_string: ""
    };

    let numericSum = 0;
    let alphabetChars = [];

    try {
        dataArray.forEach(item => {
            const str = String(item);
            
            // Check if it's a number
            if (!isNaN(str) && !isNaN(parseFloat(str)) && str.trim() !== '') {
                const num = parseInt(str);
                if (num % 2 === 0) {
                    result.even_numbers.push(str);
                } else {
                    result.odd_numbers.push(str);
                }
                numericSum += num;
            }
            // Check if it's alphabetic
            else if (/^[a-zA-Z]+$/.test(str)) {
                result.alphabets.push(str.toUpperCase());
                // Store individual characters for concatenation
                for (let char of str) {
                    alphabetChars.push(char.toLowerCase());
                }
            }
            // Special characters
            else {
                result.special_characters.push(str);
            }
        });

        result.sum = numericSum.toString();

        // Create concatenation string (reverse order, alternating caps)
        if (alphabetChars.length > 0) {
            alphabetChars.reverse();
            result.concat_string = alphabetChars.map((char, index) => {
                return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
            }).join('');
        }

    } catch (error) {
        result.is_success = false;
    }

    return result;
}

// POST /bfhl route
app.post('/bfhl', (req, res) => {
    try {
        const { data } = req.body;

        // Validate input
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                is_success: false,
                message: "Invalid input: 'data' should be an array"
            });
        }

        const result = processData(data);
        res.status(200).json(result);

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
});

// GET /bfhl route (for verification)
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        operation_code: 1
    });
});

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        message: "BFHL API is running",
        endpoints: {
            POST: "/bfhl",
            GET: "/bfhl"
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        is_success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        is_success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
});

module.exports = app;