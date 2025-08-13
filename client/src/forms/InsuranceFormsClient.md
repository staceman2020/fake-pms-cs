# InsuranceFormsClient Usage Guide

The `InsuranceFormsClient` provides a clean, Promise-based API for parent windows to communicate with FormFullPage components.

## Quick Start

```typescript
import { InsuranceFormsClient, connectToForm } from './path/to/InsuranceFormsClient';

// Option 1: Simple connection with factory function
const client = await connectToForm('your-form-id');

// Option 2: Manual connection
const client = new InsuranceFormsClient();
const { formId, formName } = await client.openForm('your-form-id');

console.log(`Connected to ${formName} (${formId})`);
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Insurance Forms Client Example</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .connected { background-color: #d4edda; color: #155724; }
        .disconnected { background-color: #f8d7da; color: #721c24; }
        .form-data { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0; }
        button { margin: 5px; padding: 10px 15px; }
    </style>
</head>
<body>
    <h1>Insurance Forms Integration</h1>
    
    <div id="status" class="status disconnected">Not connected</div>
    
    <div>
        <button onclick="openForm()">Open Form</button>
        <button onclick="sendSampleData()">Send Sample Data</button>
        <button onclick="sendCustomerData()">Send Customer Data</button>
        <button onclick="clearForm()">Clear Form</button>
        <button onclick="closeForm()">Close Form</button>
    </div>
    
    <div id="formData" class="form-data">
        <h3>Real-time Form Data:</h3>
        <pre id="dataDisplay">No data yet...</pre>
    </div>

    <script type="module">
        // Import the client (adjust path as needed)
        import { InsuranceFormsClient } from './InsuranceFormsClient.js';
        
        let client = null;
        let formWindow = null;
        
        window.openForm = async function() {
            try {
                updateStatus('Connecting...', 'disconnected');
                
                client = new InsuranceFormsClient();
                
                // Open form and connect
                const result = await client.openForm(
                    'YOUR_FORM_ID', // Replace with actual form ID
                    window.location.origin,
                    'width=1200,height=800,scrollbars=yes,resizable=yes'
                );
                
                formWindow = result.window;
                
                updateStatus(`Connected to ${result.formName}`, 'connected');
                
                // Listen for real-time form data changes
                client.onFormSave((formData) => {
                    document.getElementById('dataDisplay').textContent = 
                        JSON.stringify(formData, null, 2);
                });
                
                // Handle connection events
                client.onConnected((data) => {
                    console.log('Form connected:', data);
                });
                
            } catch (error) {
                updateStatus(`Connection failed: ${error.message}`, 'disconnected');
                console.error('Failed to open form:', error);
            }
        };
        
        window.sendSampleData = function() {
            if (!client || !client.connected) {
                alert('Please connect to a form first');
                return;
            }
            
            const sampleData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1-555-0123',
                dateOfBirth: '1985-06-15',
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zipCode: '12345'
                }
            };
            
            const success = client.sendFormData(sampleData);
            if (success) {
                console.log('Sample data sent successfully');
            }
        };
        
        window.sendCustomerData = function() {
            if (!client || !client.connected) {
                alert('Please connect to a form first');
                return;
            }
            
            const customerData = {
                policyNumber: 'POL-2025-001',
                customerType: 'Premium',
                vehicleInfo: {
                    make: 'Toyota',
                    model: 'Camry',
                    year: 2023,
                    vin: '1HGBH41JXMN109186'
                },
                coverageType: 'Full Coverage',
                annualMileage: 12000
            };
            
            client.sendFormData(customerData);
        };
        
        window.clearForm = function() {
            if (!client || !client.connected) {
                alert('Please connect to a form first');
                return;
            }
            
            // Send empty object to clear form
            client.sendFormData({});
        };
        
        window.closeForm = function() {
            if (formWindow && !formWindow.closed) {
                formWindow.close();
            }
            
            if (client) {
                client.disconnect();
                client = null;
            }
            
            formWindow = null;
            updateStatus('Disconnected', 'disconnected');
            document.getElementById('dataDisplay').textContent = 'No data yet...';
        };
        
        function updateStatus(message, className) {
            const statusEl = document.getElementById('status');
            statusEl.textContent = message;
            statusEl.className = `status ${className}`;
        }
        
        // Handle window closing
        window.addEventListener('beforeunload', () => {
            if (client) {
                client.disconnect();
            }
        });
    </script>
</body>
</html>
```

## API Reference

### Constructor

```typescript
const client = new InsuranceFormsClient(targetWindow?: Window);
```

### Methods

#### `openForm(formId, baseUrl?, windowFeatures?)`
Opens a form in a new window and connects automatically.

```typescript
const result = await client.openForm(
    'form-123',
    'https://your-domain.com',
    'width=1200,height=800'
);
// Returns: { window: Window, formId: string, formName: string }
```

#### `connect(targetWindow)`
Manually connect to an existing window.

```typescript
const { formId, formName } = await client.connect(popupWindow);
```

#### `sendFormData(data)`
Send data to populate/update form fields.

```typescript
const success = client.sendFormData({
    firstName: 'John',
    lastName: 'Doe'
});
```

#### Event Listeners

```typescript
// Form ready event
client.onFormReady(({ formId, formName }) => {
    console.log('Form loaded:', formName);
});

// Real-time data changes
client.onFormSave((formData) => {
    console.log('Form updated:', formData);
    // Save to backend, update UI, etc.
});

// Connection established
client.onConnected((data) => {
    console.log('Connected to form');
});
```

#### `sendMessage(type, data?)`
Send custom messages to the form.

```typescript
client.sendMessage('custom-action', { action: 'highlight-field', field: 'email' });
```

#### Properties

```typescript
client.connected  // boolean - connection status
client.window     // Window | null - reference to form window
```

#### `disconnect()`
Clean up and disconnect from form.

```typescript
client.disconnect();
```

## Factory Functions

### `connectToForm(formId, options?)`
One-liner to open and connect to a form.

```typescript
const client = await connectToForm('form-123', {
    baseUrl: 'https://your-domain.com',
    windowFeatures: 'width=1400,height=900',
    timeout: 15000
});
```

### `connectToIframe(iframe)`
Connect to a form loaded in an iframe.

```typescript
const iframe = document.getElementById('myFormIframe');
const client = connectToIframe(iframe);
```

## Error Handling

```typescript
try {
    const client = await connectToForm('form-123');
    // ... use client
} catch (error) {
    if (error.message.includes('timeout')) {
        console.error('Form took too long to load');
    } else if (error.message.includes('popup blocked')) {
        console.error('Popup was blocked by browser');
    } else {
        console.error('Connection failed:', error.message);
    }
}
```

## Integration Patterns

### 1. **CRM Integration**
```typescript
// Load customer data from CRM
const customerData = await fetchCustomerData(customerId);

// Open form and populate with customer data
const client = await connectToForm('insurance-application');
client.sendFormData(customerData);

// Save form data back to CRM
client.onFormSave(async (formData) => {
    await saveToCustomerRecord(customerId, formData);
});
```

### 2. **Multi-Step Workflow**
```typescript
const client = await connectToForm('step-1-form');

// When step 1 is complete
client.onFormSave(async (step1Data) => {
    if (step1Data.completed) {
        // Open step 2 with data from step 1
        const step2Client = await connectToForm('step-2-form');
        step2Client.sendFormData(step1Data);
    }
});
```

### 3. **Iframe Embedding**
```html
<iframe id="insuranceForm" src="/forms/display/form-123" width="100%" height="600"></iframe>

<script>
    const iframe = document.getElementById('insuranceForm');
    const client = connectToIframe(iframe);
    
    client.onFormReady(() => {
        // Populate with existing data
        client.sendFormData(existingCustomerData);
    });
</script>
```
