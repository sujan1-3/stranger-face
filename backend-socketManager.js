// Socket Manager for handling WebRTC signaling and user matching
const { v4: uuidv4 } = require('uuid');

class SocketManager {
    constructor(io) {
        this.io = io;
        this.waitingUsers = new Map(); // Users waiting for match
        this.connectedPairs = new Map(); // Connected user pairs
        this.reportedUsers = new Set(); // Temporarily blocked users
    }

    async findMatch(socket) {
        const { preferences } = socket.userInfo;

        // Remove user from waiting list if already there
        this.waitingUsers.delete(socket.id);

        // Find compatible match based on hobby
        const match = this.findCompatibleMatch(socket);

        if (match) {
            // Remove match from waiting list
            this.waitingUsers.delete(match.id);

            // Create connection
            this.createConnection(socket, match);
        } else {
            // Add to waiting list
            this.waitingUsers.set(socket.id, socket);
            socket.emit('waiting-for-match');
        }
    }

    findCompatibleMatch(socket) {
        const { preferences } = socket.userInfo;

        for (const [id, waitingSocket] of this.waitingUsers) {
            if (this.isCompatible(socket, waitingSocket)) {
                return waitingSocket;
            }
        }

        return null;
    }

    isCompatible(socket1, socket2) {
        // Don't match with reported users
        if (this.reportedUsers.has(socket1.id) || this.reportedUsers.has(socket2.id)) {
            return false;
        }

        // Don't match with same IP (avoid self-matching)
        if (socket1.userInfo.ip === socket2.userInfo.ip) {
            return false;
        }

        // Check hobby preferences - must match exactly
        const hobby1 = socket1.userInfo.preferences.hobby;
        const hobby2 = socket2.userInfo.preferences.hobby;

        if (hobby1 && hobby2 && hobby1 === hobby2) {
            return true;
        }

        // If no specific hobby set, allow general matching
        if (!hobby1 || !hobby2) {
            return true;
        }

        return false;
    }

    createConnection(socket1, socket2) {
        const roomId = uuidv4();

        // Join both users to the same room
        socket1.join(roomId);
        socket2.join(roomId);

        // Set matched status
        socket1.matchedWith = socket2.id;
        socket2.matchedWith = socket1.id;
        socket1.roomId = roomId;
        socket2.roomId = roomId;

        // Store pair
        this.connectedPairs.set(roomId, {
            user1: socket1.id,
            user2: socket2.id,
            startTime: new Date()
        });

        // Notify both users of match
        socket1.emit('match-found', {
            roomId,
            partner: {
                country: socket2.userInfo.country,
                countryCode: socket2.userInfo.countryCode,
                flag: socket2.userInfo.flag,
                city: socket2.userInfo.city,
                hobby: socket2.userInfo.preferences.hobby
            }
        });

        socket2.emit('match-found', {
            roomId,
            partner: {
                country: socket1.userInfo.country,
                countryCode: socket1.userInfo.countryCode,
                flag: socket1.userInfo.flag,
                city: socket1.userInfo.city,
                hobby: socket1.userInfo.preferences.hobby
            }
        });

        console.log(`Match created: ${socket1.id} <-> ${socket2.id} in room ${roomId}`);
    }

    handleNextStranger(socket) {
        // Disconnect current match
        this.disconnectMatch(socket);

        // Find new match
        this.findMatch(socket);
    }

    handleReport(socket, reportData) {
        if (socket.matchedWith) {
            console.log(`Report filed: ${socket.id} reported ${socket.matchedWith}`);

            // Temporarily block reported user (for demo - in production, save to database)
            this.reportedUsers.add(socket.matchedWith);

            // Remove block after 10 minutes (for demo)
            setTimeout(() => {
                this.reportedUsers.delete(socket.matchedWith);
            }, 10 * 60 * 1000);

            // Disconnect the match
            this.disconnectMatch(socket);

            // Notify reporter that report was submitted
            socket.emit('report-submitted');
        }
    }

    handleDisconnection(socket) {
        // Remove from waiting list
        this.waitingUsers.delete(socket.id);

        // Handle disconnection from active chat
        this.disconnectMatch(socket);
    }

    disconnectMatch(socket) {
        if (socket.matchedWith) {
            const partnerSocket = this.io.sockets.sockets.get(socket.matchedWith);

            if (partnerSocket) {
                // Notify partner of disconnection
                partnerSocket.emit('partner-disconnected');

                // Clear partner's match info
                partnerSocket.matchedWith = null;
                partnerSocket.roomId = null;

                // Leave room
                partnerSocket.leave(socket.roomId);
            }

            // Remove from connected pairs
            if (socket.roomId) {
                this.connectedPairs.delete(socket.roomId);
            }

            // Clear socket's match info
            socket.matchedWith = null;
            socket.leave(socket.roomId);
            socket.roomId = null;
        }
    }

    getStats() {
        return {
            waitingUsers: this.waitingUsers.size,
            connectedPairs: this.connectedPairs.size,
            reportedUsers: this.reportedUsers.size,
            totalConnections: this.io.sockets.sockets.size
        };
    }
}

module.exports = SocketManager;
