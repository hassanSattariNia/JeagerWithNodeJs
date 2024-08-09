// Import required modules
const express = require('express');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { trace, context } = require('@opentelemetry/api');

// Set up OpenTelemetry tracing with a defined service name
const provider = new NodeTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'my-nodejs-service', // Define your service name here
    }),
});

const exporter = new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const tracer = trace.getTracer('example-tracer');

// Set up Express application
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/trace', async (req, res) => {
    // Start the main function span
    const mainSpan = tracer.startSpan('/mainFunction');
    
    // Set the active context to the one created by the mainSpan
    await context.with(trace.setSpan(context.active(), mainSpan), async () => {
        await subFunctionA();
        mainSpan.end(); // End the main span after the sub function completes
        res.send('This request is traced!');
    });
});

async function subFunctionA() {
    // Start a span for the subfunction as a child of the current active span
    const subSpan = tracer.startSpan('/subFunctionA', {
        parent: trace.getSpan(context.active()), // Set the parent span
    });

    setTimeout(() => {
        console.log('finished subFunctionA');
        subSpan.end();  // End the sub span when the work is done
    }, 5000);
}

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
