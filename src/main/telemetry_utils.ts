import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { Analytics } from '@segment/analytics-node'

const analytics = new Analytics({
    writeKey: '6I7ptc5wcIGC4WZ0N1t0NXvvAbjRGUgX',
    flushAt: 1, // Send events immediately
    flushInterval: 1000 // Flush every second
});

export const createMitoFolder = () => {
    // Create a mito folder, if it doesn't exist
    const mitoFolder = path.join(os.homedir(), '.mito');
    if (!fs.existsSync(mitoFolder)) {
        fs.mkdirSync(mitoFolder);
    }
}

export const checkIfUserAlreadyMitoUser = () => {
    // First look for the mito folder
    const mitoFolder = path.join(os.homedir(), '.mito');
    if (!fs.existsSync(mitoFolder)) {
        return { isMitoUser: false, userId: "" };
    }

    // Then look for the user.json file
    const userJsonFile = path.join(mitoFolder, 'user.json');
    if (!fs.existsSync(userJsonFile)) {
        return { isMitoUser: false, userId: null };
    }

    // Finally, read the user.json file
    const userJson = JSON.parse(fs.readFileSync(userJsonFile, 'utf8'));
    return { isMitoUser: true, userId: userJson.static_user_id };
}

export const createTempUserId = () => {
    // If the temp user id file already exists, return the user id from the file
    if (fs.existsSync(path.join(os.homedir(), '.mito', 'temp_user_id.txt'))) {
        return fs.readFileSync(path.join(os.homedir(), '.mito', 'temp_user_id.txt'), 'utf8');
    }

    // Create a temp user id, and save it to a temp file.
    // This temp file will be picked up by the mito-ai package 
    // when it creates the user.json file. 
    createMitoFolder();
    const tempUserId = crypto.randomUUID();
    const tempUserIdFile = path.join(os.homedir(), '.mito', 'temp_user_id.txt');
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

export const identifyUser = (userId: string) => {
    analytics.identify({
        userId: userId,
        traits: {
            operating_system: process.platform,
            version_mito_desktop: process.env.npm_package_version,
        }
    });
}

export const logEvent = (userId: string, event: string, properties: any = {}) => {
    analytics.track({
        userId: userId,
        event: event,
        properties: {
            ...properties,
            operating_system: process.platform,
            version_mito_desktop: process.env.npm_package_version,
        }
    });
}
