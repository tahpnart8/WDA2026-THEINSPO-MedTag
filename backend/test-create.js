const http = require('http');

async function run() {
    // 1. Register a test user
    const regPayload = JSON.stringify({
        email: 'test_guardian_' + Date.now() + '@medtag.vn',
        password: 'password123',
        fullName: 'Test Guardian'
    });

    const regOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(regPayload)
        }
    };

    const token = await new Promise((resolve, reject) => {
        const req = http.request(regOptions, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.access_token) {
                        resolve(parsed.access_token);
                    } else {
                        console.log('REGISTER ERROR RESPONSE:', data);
                        resolve(null);
                    }
                } catch (e) {
                    console.log('REGISTER NON-JSON RESPONSE:', data);
                    resolve(null);
                }
            });
        });
        req.on('error', reject);
        req.write(regPayload);
        req.end();
    });

    if (!token) {
        console.log('Failed to register test user or get token');
        return;
    }

    // 2. Create Medical Record
    const createPayload = JSON.stringify({
        patientName: 'Test Patient',
        bloodType: 'UNKNOWN',
        emergencyPhone: '',
        emergencyContactName: ''
    });

    const createOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/portal/medical-records',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Length': Buffer.byteLength(createPayload)
        }
    };

    const req = http.request(createOptions, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('HTTP STATUS:', res.statusCode);
            console.log('RESPONSE:', data);
        });
    });
    req.on('error', e => console.error(e));
    req.write(createPayload);
    req.end();
}

run();
