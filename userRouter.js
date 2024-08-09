// userRouter.js
const express = require('express');
const tracer = require('./tracing'); // Import the tracer from tracing.js
const { trace, context } = require('@opentelemetry/api');

const router = express.Router();

router.get('/profile', (req, res) => {
    const span = tracer.startSpan('/getUserProfile');
    
    // Simulate some work
    setTimeout(() => {
        console.log('Fetching user profile');
        span.end();  // End the span when the work is done
        res.send('User profile data');
    }, 2000);
});

router.get('/settings', async (req, res) => {
    const span = tracer.startSpan('/getUserSettings');

    await context.with(trace.setSpan(context.active(), span), async () => {
        await getUserSettings(); // Some asynchronous operation
        span.end();  // End the span when the work is done
        res.send('User settings data');
    });
});

async function getUserSettings() {
    const subSpan = tracer.startSpan('/fetchUserSettings', {
        parent: trace.getSpan(context.active()), // Set the parent span
    });

    setTimeout(() => {
        console.log('Fetched user settings');
        subSpan.end();  // End the sub-span when the work is done
    }, 1000);
}

module.exports = router;
