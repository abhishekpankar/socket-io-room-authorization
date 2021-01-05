module.exports = (io) => {
    let rooms = {}
    io.of('/test').on('connection', (socket) => {
        console.log('Connected', socket.id);

        socket.on("joinRoom", ({ username, room, password }) => {
            let isEntryAvailable = userJoin(socket.id, username, room, password);
            if (isEntryAvailable) {
                socket.emit('passwordFeedback', 'correct')
            } else {
                socket.emit('passwordFeedback', 'wrong')
            }
        })
        
        socket.on('disconnect', () => {
            io.of('/test').emit('message', 'user disconnected '+ socket.id);
            if (rooms[rooms[socket.id]] && Object.keys(rooms[rooms[socket.id]]).length == 2) {
                delete rooms[rooms[socket.id]];
            } else {
                if (rooms[rooms[socket.id]] && rooms[rooms[socket.id]][socket.id]) {
                    delete rooms[rooms[socket.id]][socket.id];
                }
            }
            delete rooms[socket.id];
            console.log('Disonnected', socket.id);
            console.log(rooms);
        })

        function userJoin (socketId, username, room, password) {
            if (!rooms[room] || (rooms[room] && !rooms[room].password)) {
                if (!rooms[room]) {
                    rooms[room] = {};
                }
                rooms[room].password = password;
                rooms[room][socketId] = username;
                rooms[socketId] = room;
                return true;
            } else {
                if (rooms[room].password == password) {
                    rooms[socketId] = room;
                    rooms[room][socketId] = username;
                    socket.join(room);
                    return true;
                } else {
                    return false;
                }
            }
        }
    })
}
