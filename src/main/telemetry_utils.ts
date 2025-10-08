import { Analytics } from '@segment/analytics-node'

const analytics = new Analytics({
    writeKey: '6I7ptc5wcIGC4WZ0N1t0NXvvAbjRGUgX',
    flushAt: 1, // Send events immediately
    flushInterval: 1000 // Flush every second
});


export const logEvent = (userId: string, event: string, properties: any) => {
    analytics.track({
        userId: userId,
        event: event,
        properties: properties
    });
}
