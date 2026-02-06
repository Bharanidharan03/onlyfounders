const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { users, communities, messages, joinRequests, recommendations } = require('./data');
const { autoJoinAll, joinCommunity, leaveCommunity, requestToJoin, handleJoinRequest } = require('./membershipService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Run auto-join logic on startup
autoJoinAll();

// REST API Routes
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/communities', (req, res) => res.json(communities));
app.get('/api/communities/:id', (req, res) => {
    const community = communities.find(c => c.id === req.params.id);
    res.json(community);
});

app.post('/api/communities', (req, res) => {
    const { name, description, tags, created_by, visibility } = req.body;
    const newCommunity = {
        id: `COM_${communities.length + 1}`,
        name,
        description,
        tags,
        created_by,
        visibility: visibility || 'public',
        members: [created_by]
    };
    communities.push(newCommunity);

    // Also update user's joined communities
    const user = users.find(u => u.id === created_by);
    if (user) {
        user.joined_communities.push({
            id: newCommunity.id,
            reason: "Created this community"
        });
    }

    res.status(201).json(newCommunity);
});

// Join Request Routes
app.post('/api/communities/:id/request', (req, res) => {
    const { userId, message } = req.body;
    const result = requestToJoin(userId, req.params.id, message);
    if (result.success) res.json(result.request);
    else res.status(400).json(result);
});

app.post('/api/communities/:id/join', (req, res) => {
    const { userId } = req.body;
    const result = joinCommunity(userId, req.params.id, "Joined through discovery");
    if (result) res.json({ success: true });
    else res.status(400).json({ success: false, message: "Could not join community" });
});

app.get('/api/communities/:id/requests', (req, res) => {
    const requests = joinRequests.filter(r => r.communityId === req.params.id && r.status === 'pending');
    res.json(requests);
});

app.post('/api/requests/:id/handle', (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'
    const result = handleJoinRequest(req.params.id, action);
    if (result.success) res.json(result.request);
    else res.status(400).json(result);
});

app.get('/api/users/:id/communities', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).send('User not found');

    const userCommunities = communities.filter(c =>
        user.joined_communities.some(jc => jc.id === c.id)
    ).map(c => {
        const jc = user.joined_communities.find(j => j.id === c.id);
        return { ...c, join_reason: jc.reason };
    });

    res.json(userCommunities);
});

// Recommendation Routes (AI Integration)
app.post('/api/recommendations', (req, res) => {
    const { userId, recommendedCommunityIds } = req.body;
    const existingIndex = recommendations.findIndex(r => r.userId === userId);
    if (existingIndex > -1) {
        recommendations[existingIndex].communityIds = recommendedCommunityIds;
    } else {
        recommendations.push({ userId, communityIds: recommendedCommunityIds });
    }
    res.json({ success: true });
});

app.get('/api/recommendations/:userId', (req, res) => {
    const rec = recommendations.find(r => r.userId === req.params.userId);
    if (!rec) return res.json([]);

    const recommendedComms = communities.filter(c => rec.communityIds.includes(c.id));
    res.json(recommendedComms);
});

// Socket.io Real-time Chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_community', (communityId) => {
        socket.join(communityId);
        console.log(`User ${socket.id} joined room: ${communityId}`);

        // Send message history for this community
        const history = messages.filter(m => m.community_id === communityId);
        socket.emit('message_history', history);
    });

    socket.on('send_message', (data) => {
        const { community_id, sender_id, encrypted_payload } = data;
        const newMessage = {
            message_id: `MSG_${messages.length + 1}`,
            community_id,
            sender_id,
            encrypted_payload,
            timestamp: new Date().toISOString()
        };
        messages.push(newMessage);

        // Broadcast to the community room
        io.to(community_id).emit('receive_message', newMessage);
    });

    socket.on('typing', (data) => {
        const { community_id, sender_name } = data;
        socket.to(community_id).emit('typing_indicator', { sender_name });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
