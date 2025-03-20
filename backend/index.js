const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const pptx2json = require('pptx2json');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const NodeCache = require('node-cache');

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Enable CORS
app.use(cors());

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Constants
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "eGgiAPcDIWwL3NrRnGQCRrFarbHxLKxg";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const CHUNK_SIZE = 800; // Increased chunk size to reduce API calls
const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY = 5000;
const MAX_DELAY = 60000;
const MAX_CONCURRENT_REQUESTS = 1;
const REQUEST_DELAY = 3000; // Reduced delay between requests
const PROCESSING_TIMEOUT = 300000; // Increased timeout to 5 minutes

// Helper functions
const chunkText = (text) => {
    // Split by sentences for better context
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > CHUNK_SIZE) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    
    return chunks;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoffDelay = (retryCount) => {
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_DELAY);
    return delay + Math.random() * 1000; // Add jitter
};

const queryMistral = async (prompt, retryCount = 0) => {
    try {
        // Add delay before each request
        await sleep(REQUEST_DELAY);

        const response = await axios.post(MISTRAL_API_URL, {
            model: "mistral-small",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 200, // Reduced max tokens
        }, {
            headers: {
                "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 30000 // Increased timeout
        });

        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response from Mistral API');
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
            const delay = calculateBackoffDelay(retryCount);
            console.log(`Rate limit hit. Retrying in ${Math.round(delay/1000)} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await sleep(delay);
            return queryMistral(prompt, retryCount + 1);
        }
        throw new Error(`Mistral API Error: ${error.response?.data?.error?.message || error.message}`);
    }
};

// Process chunks sequentially with rate limiting
const processChunksSequentially = async (chunks, processor) => {
    const results = [];
    for (const chunk of chunks) {
        try {
            const result = await processor(chunk);
            if (result && Array.isArray(result)) {
                results.push(...result);
            } else if (result) {
                results.push(result);
            }
            // Add delay between chunks
            await sleep(3000);
        } catch (error) {
            console.error('Error processing chunk:', error);
            // Continue with next chunk even if one fails
        }
    }
    return results;
};

const summarizeText = async (text) => {
    try {
        const chunks = chunkText(text);
        const summaries = await processChunksSequentially(chunks, async (chunk) => {
            const prompt = `Summarize this text in 2-3 sentences:\n${chunk}`;
            return await queryMistral(prompt);
        });
        return summaries.join(" ");
    } catch (error) {
        console.error('Summarization Error:', error);
        throw new Error(`Summarization Error: ${error.message}`);
    }
};

const generateQuestions = async (text, questionType, numQuestions) => {
    try {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input');
        }

        const chunks = chunkText(text);
        if (!chunks || chunks.length === 0) {
            throw new Error('No text chunks to process');
        }

        const allQuestions = [];
        let processedChunks = 0;
        const maxChunks = Math.min(chunks.length, 5); // Increased max chunks to 5 for better coverage

        // Normalize question type
        const normalizedQuestionType = questionType.toLowerCase().trim();

        // Define valid question types
        const validQuestionTypes = {
            '1marker': '1marker',
            '2marker': '2marker',
            '5marker': '5marker',
            'truefalse': 'truefalse'
        };

        if (!validQuestionTypes[normalizedQuestionType]) {
            throw new Error(`Invalid question type: ${questionType}. Valid types are: ${Object.keys(validQuestionTypes).join(', ')}`);
        }

        for (const chunk of chunks.slice(0, maxChunks)) {
            try {
                let prompt;
                switch(normalizedQuestionType) {
                    case '1marker':
                        prompt = `Create 2-3 one-mark questions from this text. Format as JSON array with "question" and "answer" fields. Questions should be very short and direct. Example format: [{"question": "What is X?", "answer": "X is Y"}]:\n${chunk}`;
                        break;
                    case '2marker':
                        prompt = `Create 2-3 two-mark questions from this text. Format as JSON array with "question" and "answer" fields. Answers should be 2-3 sentences. Example format: [{"question": "What is X?", "answer": "X is Y"}]:\n${chunk}`;
                        break;
                    case '5marker':
                        prompt = `Create 2-3 five-mark questions from this text. Format as JSON array with "question" and "answer" fields. Answers should be detailed with multiple points. Example format: [{"question": "What is X?", "answer": "X is Y"}]:\n${chunk}`;
                        break;
                    case 'truefalse':
                        prompt = `Create 2-3 true/false statements from this text. Format as JSON array with "question" and "answer" fields. Include explanation in answer. Example format: [{"question": "Statement: X is Y", "answer": "True/False: Explanation"}]:\n${chunk}`;
                        break;
                    default:
                        throw new Error(`Invalid question type: ${questionType}`);
                }

                const response = await queryMistral(prompt);
                let chunkQuestions = [];
                
                try {
                    // Try to parse as JSON first
                    const parsedResponse = JSON.parse(response);
                    if (Array.isArray(parsedResponse)) {
                        chunkQuestions = parsedResponse;
                    }
                } catch (parseError) {
                    console.log('JSON parsing failed, trying text parsing...');
                    // If JSON parsing fails, try to parse as text
                    const lines = response.split('\n');
                    let currentQuestion = null;
                    let currentAnswer = null;

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) continue;

                        if (trimmedLine.startsWith('Q:') || trimmedLine.startsWith('Question:') || 
                            trimmedLine.startsWith('Statement:') || trimmedLine.startsWith('True/False:')) {
                            if (currentQuestion && currentAnswer) {
                                chunkQuestions.push({ question: currentQuestion, answer: currentAnswer });
                            }
                            currentQuestion = trimmedLine
                                .replace(/^[Q:Question:Statement:True\/False:]\s*/, '')
                                .trim();
                            currentAnswer = null;
                        } else if (trimmedLine.startsWith('A:') || trimmedLine.startsWith('Answer:')) {
                            currentAnswer = trimmedLine
                                .replace(/^[A:Answer:]\s*/, '')
                                .trim();
                        } else if (!currentQuestion) {
                            currentQuestion = trimmedLine;
                        } else if (!currentAnswer) {
                            currentAnswer = trimmedLine;
                        }
                    }

                    if (currentQuestion && currentAnswer) {
                        chunkQuestions.push({ question: currentQuestion, answer: currentAnswer });
                    }
                }

                // Filter out invalid questions and add valid ones
                const validQuestions = chunkQuestions.filter(q => 
                    q && 
                    typeof q.question === 'string' && 
                    typeof q.answer === 'string' && 
                    q.question.trim() && 
                    q.answer.trim() &&
                    q.question.length > 10 && // Ensure question is meaningful
                    q.answer.length > 10 // Ensure answer is meaningful
                );
                
                if (validQuestions.length > 0) {
                    allQuestions.push(...validQuestions);
                }
                
                processedChunks++;
                console.log(`Processed chunk ${processedChunks}/${maxChunks}`);
                
                // Add delay between chunks
                await sleep(REQUEST_DELAY);
            } catch (chunkError) {
                console.error('Error processing chunk:', chunkError);
                // Continue with next chunk even if one fails
            }
        }

        // If no questions were generated, try one more time with a different prompt
        if (!allQuestions || allQuestions.length === 0) {
            console.log('No questions generated, trying alternative prompt...');
            const alternativePrompt = `Create 3 questions from this text. Format as JSON array with "question" and "answer" fields. Make questions clear and direct:\n${text.slice(0, 1000)}`;
            
            try {
                const response = await queryMistral(alternativePrompt);
                const parsedResponse = JSON.parse(response);
                if (Array.isArray(parsedResponse)) {
                    const validQuestions = parsedResponse.filter(q => 
                        q && 
                        typeof q.question === 'string' && 
                        typeof q.answer === 'string' && 
                        q.question.trim() && 
                        q.answer.trim()
                    );
                    if (validQuestions.length > 0) {
                        return validQuestions.slice(0, numQuestions);
                    }
                }
            } catch (error) {
                console.error('Alternative prompt failed:', error);
            }
        }

        // If still no questions, throw an error
        if (!allQuestions || allQuestions.length === 0) {
            throw new Error('No valid questions could be generated from the text');
        }

        // Return the requested number of questions
        return allQuestions.slice(0, numQuestions);
    } catch (error) {
        console.error('Question Generation Error:', error);
        throw new Error(`Question Generation Error: ${error.message}`);
    }
};

// Routes
app.post('/api/process-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const questionType = req.body.questionType || '1marker';
        const numQuestions = parseInt(req.body.numQuestions) || 5;

        console.log('Starting file processing:', {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            questionType,
            numQuestions
        });

        // Check cache first
        const fileHash = req.file.filename + questionType + numQuestions;
        const cachedResult = cache.get(fileHash);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        let text = '';
        const filePath = req.file.path;

        // Extract text based on file type
        try {
            if (req.file.mimetype === 'application/pdf') {
                console.log('Processing PDF file...');
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdfParse(dataBuffer);
                text = data.text || '';
                console.log(`PDF text length: ${text.length} characters`);
            } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
                console.log('Processing PPTX file...');
                const json = await pptx2json.toJSON(filePath);
                text = json.slides?.map(slide => 
                    slide.texts?.map(text => text.text || '').join(' ') || ''
                ).join('\n') || '';
                console.log(`PPTX text length: ${text.length} characters`);
            } else {
                return res.status(400).json({ error: 'Unsupported file format' });
            }
        } catch (extractError) {
            console.error('Error extracting text from file:', extractError);
            throw new Error(`Failed to extract text from file: ${extractError.message}`);
        }

        if (!text.trim()) {
            throw new Error('No text content found in the file');
        }

        console.log('Starting text processing...');
        // Process with increased timeout
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Processing timeout - please try with a smaller file or fewer questions')), PROCESSING_TIMEOUT)
        );

        const result = await Promise.race([
            Promise.all([
                summarizeText(text),
                generateQuestions(text, questionType, numQuestions)
            ]).then(([summary, questions]) => ({ 
                summary: summary || '', 
                questions: questions || [],
                questionType 
            })),
            timeout
        ]);
        
        console.log('Processing completed successfully');
        // Cache the result
        cache.set(fileHash, result);

        // Clean up
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json(result);
    } catch (error) {
        console.error('Error processing file:', {
            error: error.message,
            stack: error.stack,
            file: req.file?.originalname,
            path: req.file?.path
        });
        
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            error: 'Error processing file',
            details: error.message || 'Unknown error occurred'
        });
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});