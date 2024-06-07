addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/login') {
        return await handleDeviceRequest();
    } else if (request.method === 'GET' && url.pathname === '/ghu') {
        return await handleGhuRequest(url);
    } else {
        return new Response('Not Found', { status: 404 });
    }
}

async function handleDeviceRequest() {
    const url = 'https://github.com/login/device/code';
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const data = {
        client_id: 'Iv1.b507a08c87ecfe98',
        scope: 'read:user'
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });

    const responseData = await response.json();
    const userCode = responseData.user_code;
    const deviceCode = responseData.device_code;
    const authUrl = 'https://github.com/login/device';

    return new Response(JSON.stringify({ user_code: userCode, device_code: deviceCode, auth_url: authUrl }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleGhuRequest(url) {
    const deviceCode = url.searchParams.get('code');
    if (!deviceCode) {
        return new Response(JSON.stringify({ error: 'Missing device code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const accessTokenUrl = 'https://github.com/login/oauth/access_token';
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const data = {
        client_id: 'Iv1.b507a08c87ecfe98',
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    };

    const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });

    const responseData = await response.json();
    
    if (responseData.error === "authorization_pending") {
        return new Response(JSON.stringify({ token: "等待授权..." }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else if (responseData.access_token) {
        return new Response(JSON.stringify({ token: responseData.access_token }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        return new Response(JSON.stringify({ error: responseData.error }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
