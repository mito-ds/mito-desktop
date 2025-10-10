import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { Analytics } from '@segment/analytics-node'
import { isDevMode } from './utils';

const MITO_FOLDER = path.join(os.homedir(), '.mito');
const USER_JSON_FILE = 'user.json';
const TEMP_USER_ID_FILE = 'temp_user_id.txt';

const analytics = new Analytics({
    writeKey: '6I7ptc5wcIGC4WZ0N1t0NXvvAbjRGUgX',
    flushAt: 1, // Send events immediately
    flushInterval: 1000 // Flush every second
});

export const createMitoFolder = () => {
    // Create a mito folder, if it doesn't exist
    if (!fs.existsSync(MITO_FOLDER)) {
        fs.mkdirSync(MITO_FOLDER);
    }
}

export const checkIfUserAlreadyMitoUser = () => {
    // First look for the mito folder
    if (!fs.existsSync(MITO_FOLDER)) {
        return { isMitoUser: false, userId: "" };
    }

    // Then look for the user.json file
    const userJsonFile = path.join(MITO_FOLDER, USER_JSON_FILE);
    if (!fs.existsSync(userJsonFile)) {
        return { isMitoUser: false, userId: null };
    }

    // Finally, read the user.json file
    const userJson = JSON.parse(fs.readFileSync(userJsonFile, 'utf8'));
    return { isMitoUser: true, userId: userJson.static_user_id };
}

export const createTempUserId = () => {
    // If the temp user id file already exists, return the user id from the file
    if (fs.existsSync(path.join(MITO_FOLDER, TEMP_USER_ID_FILE))) {
        return fs.readFileSync(path.join(MITO_FOLDER, TEMP_USER_ID_FILE), 'utf8');
    }

    // Create a temp user id, and save it to a temp file.
    // This temp file will be picked up by the mito-ai package 
    // when it creates the user.json file. 
    createMitoFolder();
    const tempUserId = crypto.randomUUID();
    const tempUserIdFile = path.join(MITO_FOLDER, TEMP_USER_ID_FILE);
    fs.writeFileSync(tempUserIdFile, tempUserId);
    return tempUserId;
}

export const getUserId = () => {
    // First check if the user is already a Mito user
    const { isMitoUser, userId } = checkIfUserAlreadyMitoUser();
    if (isMitoUser) {
        return userId;
    }
    // If not, create a new temp user id
    return createTempUserId();
}

export const identifyUser = () => {
    analytics.identify({
        userId: getUserId(),
        traits: {
            operating_system: process.platform,
            version_mito_desktop: process.env.npm_package_version,
            is_dev_mode: isDevMode(),
            email: isDevMode() ? 'dev@trymito.io' : undefined
        }
    });
}

export const logEvent = (event: string, properties: any = {}) => {
    analytics.track({
        userId: getUserId(),
        event: event,
        properties: {
            ...properties,
            operating_system: process.platform,
            version_mito_desktop: process.env.npm_package_version,
        }
    });
}
