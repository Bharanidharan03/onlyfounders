// Use global fetch
async function verify() {
    console.log("--- Verifying Backend API ---");

    try {
        // 1. Check Users
        const usersRes = await fetch('http://localhost:3002/api/users');
        const users = await usersRes.json();
        console.log(`Users fetched: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (Joined: ${u.joined_communities.length})`));

        // 2. Check Auto-join for Alice (STU_1023)
        const aliceCommsRes = await fetch('http://localhost:3002/api/users/STU_1023/communities');
        const aliceComms = await aliceCommsRes.json();
        console.log(`\nAlice's Communities: ${aliceComms.length}`);
        aliceComms.forEach(c => console.log(`- ${c.name} (Reason: ${c.join_reason})`));

        // 3. Create a new community
        console.log("\nCreating 'Rust Enthusiasts'...");
        const createRes = await fetch('http://localhost:3002/api/communities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Rust Enthusiasts',
                description: 'Systems programming with Rust.',
                tags: ['rust', 'systems'],
                created_by: 'STU_1023'
            })
        });
        const newComm = await createRes.json();
        console.log(`New Community: ${newComm.name} (ID: ${newComm.id})`);

        // 4. Verify Alice joined the new community
        const aliceUpdatedCommsRes = await fetch('http://localhost:3002/api/users/STU_1023/communities');
        const aliceUpdatedComms = await aliceUpdatedCommsRes.json();
        console.log(`Alice's Updated Communities: ${aliceUpdatedComms.length}`);

    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}

verify();
