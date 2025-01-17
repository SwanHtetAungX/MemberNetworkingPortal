const io = require("socket.io")(8900,
    {
        cors:{
            origin:"*",
        }
    });

let users = [];


const removeUser = (socketId) => {
    users = users.filter((user) =>user.socketId !== socketId);
}

const addUser = (userId, socketId) => {
    !users.some((user)=>user.userId === userId) &&
    users.push({userId, socketId});
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId)
}


io.on("connection", (socket) => {
    console.log("a user connected.")

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users)

    });

    //send and get message
    socket.on("sendMessage", ({senderId,receiverId,text}) =>{
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text,

        })
        
    })

   
    socket.on("announcementAcknowledged", () => {
        
        io.emit("refreshAnnouncements");
    });

    socket.on("newAnnouncementCreated", () => {
        io.emit("refreshApp");
    });




    

    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users)
    })



    
})