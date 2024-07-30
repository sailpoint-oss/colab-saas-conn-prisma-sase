import { ConnectorError, logger } from '@sailpoint/connector-sdk'

// Function to check if a token is still good
export async function check_token_expiration() {
    // Check EXPIRATION_TIME
    let now = 0
    now = Date.now();
    console.log('now Time =        ' + now)
    console.log('Expiration Time = ' + globalThis.__EXPIRATION_TIME)
    const time_buffer = 250
    let valid_token = 'valid'
    if (!globalThis.__EXPIRATION_TIME) {
        console.log('######### Expiration Time is undefined')
        valid_token = 'undefined'
    }
    else {
        if (globalThis.__EXPIRATION_TIME - time_buffer <= now) {
            console.log('Expiration Time is in the past')
            valid_token = 'expired'
        }
        else {
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            valid_token = 'valid'
        }
    }

    return valid_token
}

// Function to perform the authentication and retrieve a token.
export async function auth() {
    let base64data = Buffer.from(globalThis.__CLIENT_ID + ':' + globalThis.__CLIENT_SECRET).toString('base64')
    const authorization = 'Basic ' + base64data

    const axios = require('axios');
    const qs = require('querystring');
    const data = {
        grant_type: 'client_credentials',
        scope: 'tsg_id:' + globalThis.__TSGID
    };
    console.log('AuthUrl = ' + globalThis.__AUTHURL)

    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__AUTHURL,
        data: qs.stringify(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authorization
        }
    };

    try {
        let resAuth = await axios(config)
        // Store res data in Global variable
        let now = 0
        now = Date.now();
        globalThis.__ACCESS_TOKEN = resAuth.data.access_token
        globalThis.__EXPIRATION_TIME = now + (resAuth.data.expires_in * 1000)
        return resAuth
    } catch (err: any) {
        throw new ConnectorError(err.name + '  ::  ' + err.message)
    }
}