const { users, communities, joinRequests } = require('./data');

const autoJoinAll = () => {
    users.forEach(user => {
        communities.forEach(community => {
            // Auto-join only for public communities
            if (community.visibility !== 'public') return;

            const intersection = user.interests.filter(interest =>
                community.tags.includes(interest)
            );

            if (intersection.length > 0) {
                if (!community.members.includes(user.id)) {
                    community.members.push(user.id);
                    if (!user.joined_communities.find(c => c.id === community.id)) {
                        user.joined_communities.push({
                            id: community.id,
                            reason: `You were added to ${community.name} because of your interest in: ${intersection.join(', ')}`
                        });
                        console.log(`Auto-joined ${user.name} to ${community.name}`);
                    }
                }
            }
        });
    });
};

const requestToJoin = (userId, communityId, message) => {
    const existingRequest = joinRequests.find(r => r.userId === userId && r.communityId === communityId);
    if (existingRequest) return { success: false, message: "Request already pending" };

    const request = {
        id: `REQ_${joinRequests.length + 1}`,
        userId,
        communityId,
        message: message || "I'd like to join this community",
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    joinRequests.push(request);
    return { success: true, request };
};

const handleJoinRequest = (requestId, action) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return { success: false, message: "Request not found" };

    if (action === 'approve') {
        request.status = 'approved';
        joinCommunity(request.userId, request.communityId, "Request approved by admin");
    } else {
        request.status = 'rejected';
    }
    return { success: true, request };
};

const joinCommunity = (userId, communityId, reason = "Manually joined") => {
    const user = users.find(u => u.id === userId);
    const community = communities.find(c => c.id === communityId);

    if (user && community && !community.members.includes(userId)) {
        community.members.push(userId);
        user.joined_communities.push({
            id: communityId,
            reason: reason
        });
        return true;
    }
    return false;
};

const leaveCommunity = (userId, communityId) => {
    const user = users.find(u => u.id === userId);
    const community = communities.find(c => c.id === communityId);

    if (user && community) {
        community.members = community.members.filter(id => id !== userId);
        user.joined_communities = user.joined_communities.filter(c => c.id !== communityId);
        return true;
    }
    return false;
};

module.exports = { autoJoinAll, joinCommunity, leaveCommunity, requestToJoin, handleJoinRequest };
