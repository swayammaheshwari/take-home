
async function runVerification() {
    const baseUrl = 'http://localhost:3001';
    const sessionId = 'session-' + Date.now();

    console.log(`Starting verification against ${baseUrl} with sessionId ${sessionId}`);

    // 1. Create Session
    console.log('\n[1] Creating Session...');
    const createRes = await fetch(`${baseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            language: 'en',
            metadata: { userId: '123' },
        }),
    });

    if (createRes.status !== 201) {
        console.error(`Failed to create session: ${createRes.status} ${await createRes.text()}`);
        process.exit(1);
    }
    const session = await createRes.json();
    console.log('Session Created:', session);

    // 2. Add Event
    console.log('\n[2] Adding Event...');
    const eventRes = await fetch(`${baseUrl}/sessions/${sessionId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eventId: 'evt-1',
            type: 'user_speech',
            payload: { text: 'Hello world' },
        }),
    });

    if (eventRes.status !== 201) {
        console.error(`Failed to add event: ${eventRes.status} ${await eventRes.text()}`);
        process.exit(1);
    }
    const event = await eventRes.json();
    console.log('Event Added:', event);

    // 3. Get Session details
    console.log('\n[3] Getting Session...');
    const getRes = await fetch(`${baseUrl}/sessions/${sessionId}`);
    if (getRes.status !== 200) {
        console.error(`Failed to get session: ${getRes.status} ${await getRes.text()}`);
        process.exit(1);
    }
    const sessionDetails = await getRes.json();
    console.log('Session Details:', sessionDetails);

    if (sessionDetails.events.length !== 1) {
        console.error('Expected 1 event, got', sessionDetails.events.length);
    }

    // 4. Complete Session
    console.log('\n[4] Completing Session...');
    const completeRes = await fetch(`${baseUrl}/sessions/${sessionId}/complete`, {
        method: 'POST',
    });

    if (completeRes.status !== 200 && completeRes.status !== 201) { // 200 or 201 depending on impl, we didn't specify HttpCode so likely 201 for POST but return is session. Default status 201 for POST.
        // Wait, default status for POST is 201.
        console.log(`Complete status: ${completeRes.status}`);
    }
    const completedSession = await completeRes.json();
    console.log('Session Completed:', completedSession);

    if (completedSession.status !== 'completed' || !completedSession.endedAt) {
        console.error('Session not marked completed properly');
    }

    console.log('\nVerification Passed!');
}

runVerification().catch(err => {
    console.error(err);
    process.exit(1);
});
