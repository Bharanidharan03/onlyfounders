// Use global fetch
async function verifyPrivateFlow() {
    console.log("--- Verifying Private Community Flow ---");

    try {
        // 1. Initial State: Alice (STU_1023) should NOT be in Machine Learning Hub (COM_2)
        const comm2Res = await fetch('http://localhost:3002/api/communities/COM_2');
        const comm2 = await comm2Res.json();
        console.log(`\nMachine Learning Hub (COM_2) Visibility: ${comm2.visibility}`);
        console.log(`Is Alice a member? ${comm2.members.includes('STU_1023')}`);

        // 2. Alice requests to join Machine Learning Hub
        console.log("\nAlice (STU_1023) requesting to join COM_2...");
        const requestRes = await fetch('http://localhost:3002/api/communities/COM_2/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'STU_1023',
                message: 'I love ML!'
            })
        });
        const request = await requestRes.json();
        console.log(`Request created: ID=${request.id}, Status=${request.status}`);

        // 3. Bob (STU_1024) is the creator of COM_2. Check pending requests for COM_2.
        const pendingRes = await fetch('http://localhost:3002/api/communities/COM_2/requests');
        const pending = await pendingRes.json();
        console.log(`\nPending requests for COM_2: ${pending.length}`);
        pending.forEach(r => console.log(`- Request from ${r.userId}: "${r.message}"`));

        // 4. Bob approves Alice's request
        if (pending.length > 0) {
            console.log(`\nApproving request ${pending[0].id}...`);
            const handleRes = await fetch(`http://localhost:3002/api/requests/${pending[0].id}/handle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            });
            const approvedReq = await handleRes.json();
            console.log(`Request status: ${approvedReq.status}`);

            // 5. Verify Alice is now a member
            const updatedComm2Res = await fetch('http://localhost:3002/api/communities/COM_2');
            const updatedComm2 = await updatedComm2Res.json();
            console.log(`\nIs Alice now a member of COM_2? ${updatedComm2.members.includes('STU_1023')}`);

            const aliceCommsRes = await fetch('http://localhost:3002/api/users/STU_1023/communities');
            const aliceComms = await aliceCommsRes.json();
            const joined = aliceComms.find(c => c.id === 'COM_2');
            console.log(`Alice's join reason for COM_2: ${joined ? joined.join_reason : 'Not found'}`);
        }

    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}

verifyPrivateFlow();
