// import "./Chat.css";
// import { useRef, useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { io } from "socket.io-client";
// import { List, Card, Input, Button, Typography } from 'antd';
// import Conversation from "../../components/conversations/Conversation";
// import Message from "../../components/messages/Message";
// import ChatOnline from "../../components/chatOnline/chatOnline";

// const { TextArea } = Input;
// const { Text } = Typography;

// function Messenger() {
//   const location = useLocation();
//   const query = new URLSearchParams(location.search);
//   const conversationIdFromUrl = query.get("conversationId");

//   const userId = sessionStorage.getItem("id");
//   const [currentChat, setCurrentChat] = useState(null);
//   const [conversations, setConversations] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [arrivalMessage, setArrivalMessage] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const socket = useRef();
//   const scrollRef = useRef();

//   useEffect(() => {
//     socket.current = io("ws://localhost:8900");
//     socket.current.on("getMessage", async (data) => {
//       try {
//         const res = await axios.get(`http://localhost:5050/members/${data.senderId}`);
//         setArrivalMessage({
//           sender: data.senderId,
//           text: data.text,
//           createdAt: Date.now(),
//           senderProfileImage: res.data.ProfilePic,
//         });
//       } catch (err) {
//         console.log("Failed to fetch sender data", err);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) &&
//       setMessages((prev) => [...prev, arrivalMessage]);
//   }, [arrivalMessage, currentChat]);

//   console.log("c",currentChat)

//   useEffect(() => {
//     socket.current.emit("addUser", userId);
//     socket.current.on("getUsers", (users) => {
//       setOnlineUsers(users);
//     });
//   }, [userId]);

//   useEffect(() => {
//     const getConversations = async () => {
//       try {
//         const res = await axios.get("http://localhost:5050/conversation/" + userId);
//         setConversations(res.data);
//         if (conversationIdFromUrl) {
//           const currentConversation = res.data.find(c => c._id === conversationIdFromUrl);
//           if (currentConversation) setCurrentChat(currentConversation);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     getConversations();
//   }, [userId, conversationIdFromUrl]);

//   useEffect(() => {
//     if (currentChat) {
//       const getMessages = async () => {
//         try {
//           const res = await axios.get("http://localhost:5050/message/" + currentChat._id);
//           const messagesWithProfile = await Promise.all(res.data.map(async (msg) => {
//             try {
//               const senderRes = await axios.get(`http://localhost:5050/members/${msg.senderId}`);
//               return { ...msg, senderProfileImage: senderRes.data.ProfilePic };
//             } catch (err) {
//               console.log("Failed to fetch sender profile image", err);
//               return { ...msg, senderProfileImage: "default-profile.png" };
//             }
//           }));
//           setMessages(messagesWithProfile);
//         } catch (err) {
//           console.log(err);
//         }
//       };
//       getMessages();
//     }
//   }, [currentChat]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     let senderProfileImage = "";
//     try {
//       const res = await axios.get(`http://localhost:5050/members/${userId}`);
//       senderProfileImage = res.data.ProfilePic;
//     } catch (err) {
//       console.log("Failed to fetch your profile image", err);
//     }

//     const message = {
//       conversationId: currentChat._id,
//       senderId: userId,
//       text: newMessage,
//     };
//     const receiverId = currentChat.members.find(member => member !== userId);
//     socket.current.emit("sendMessage", {
//       senderId: userId,
//       receiverId,
//       text: newMessage,
//     });
//     try {
//       const res = await axios.post("http://localhost:5050/message", message);
//       setMessages([...messages, { ...res.data, senderProfileImage }]);
//       setNewMessage("");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="messenger">
//       <Card className="chatMenu">
//         <List
//           itemLayout="horizontal"
//           dataSource={conversations}
//           renderItem={c => (
//             <List.Item onClick={() => setCurrentChat(c)}>
//               <Conversation conversation={c} currentUser={userId} />
//             </List.Item>
//           )}
//         />
//       </Card>

//       <Card className="chatBox">
//         {currentChat ? (
//           <>
//             <div className="chatBoxTop">
//               {messages.map((m) => (
//                 <div ref={scrollRef}>
//                   <Message message={m} own={m.senderId === userId} profileImage={m.senderProfileImage} />
//                 </div>
//               ))}
//             </div>
//             <div className="chatBoxBottom">
//               <TextArea
//                 className="chatMessageInput"
//                 placeholder="Write something..."
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 value={newMessage}
//                 rows={4}
//               />
//               <Button type="primary" className="chatSubmitButton" onClick={handleSubmit}>
//                 Send
//               </Button>
//             </div>
//           </>
//         ) : (
//           <Text className="noConversationText">Open a conversation to start a chat.</Text>
//         )}
//       </Card>

//       <Card className="chatOnline">
//         <ChatOnline onlineUsers={onlineUsers} currentId={userId} setCurrentChat={setCurrentChat} />
//       </Card>
//     </div>
//   );
// }

// export default Messenger;

import "./Chat.css";
import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { List, Card, Input, Button, Typography, Avatar } from 'antd';
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/messages/Message";
import ChatOnline from "../../components/chatOnline/chatOnline";

const { TextArea } = Input;
const { Text } = Typography;

function Messenger() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const conversationIdFromUrl = query.get("conversationId");

  const userId = sessionStorage.getItem("id");
  const [currentChat, setCurrentChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null); // State for the current chat user's data

  const socket = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", async (data) => {
      try {
        const res = await axios.get(`http://localhost:5050/members/${data.senderId}`);
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          createdAt: Date.now(),
          senderProfileImage: res.data.ProfilePic,
        });
      } catch (err) {
        console.log("Failed to fetch sender data", err);
      }
    });
  }, []);

  useEffect(() => {
    arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", userId);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(users);
    });
  }, [userId]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("http://localhost:5050/conversation/" + userId);
        setConversations(res.data);
        if (conversationIdFromUrl) {
          const currentConversation = res.data.find(c => c._id === conversationIdFromUrl);
          if (currentConversation) setCurrentChat(currentConversation);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [userId, conversationIdFromUrl]);

  useEffect(() => {
    if (currentChat) {
      const getMessages = async () => {
        try {
          const res = await axios.get("http://localhost:5050/message/" + currentChat._id);
          const messagesWithProfile = await Promise.all(res.data.map(async (msg) => {
            try {
              const senderRes = await axios.get(`http://localhost:5050/members/${msg.senderId}`);
              return { ...msg, senderProfileImage: senderRes.data.ProfilePic };
            } catch (err) {
              console.log("Failed to fetch sender profile image", err);
              return { ...msg, senderProfileImage: "default-profile.png" };
            }
          }));
          setMessages(messagesWithProfile);
          
          // Get the chat user's profile for the banner
          const chatUserId = currentChat.members.find(member => member !== userId);
          const userRes = await axios.get(`http://localhost:5050/members/${chatUserId}`);
          setChatUser(userRes.data);
        } catch (err) {
          console.log(err);
        }
      };
      getMessages();
    }
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let senderProfileImage = "";
    try {
      const res = await axios.get(`http://localhost:5050/members/${userId}`);
      senderProfileImage = res.data.ProfilePic;
    } catch (err) {
      console.log("Failed to fetch your profile image", err);
    }

    const message = {
      conversationId: currentChat._id,
      senderId: userId,
      text: newMessage,
    };
    const receiverId = currentChat.members.find(member => member !== userId);
    socket.current.emit("sendMessage", {
      senderId: userId,
      receiverId,
      text: newMessage,
    });
    try {
      const res = await axios.post("http://localhost:5050/message", message);
      setMessages([...messages, { ...res.data, senderProfileImage }]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messenger">
      <Card className="chatMenu">
        <List
          itemLayout="horizontal"
          dataSource={conversations}
          renderItem={c => (
            <List.Item onClick={() => setCurrentChat(c)}>
              <Conversation conversation={c} currentUser={userId} />
            </List.Item>
          )}
        />
      </Card>

      <Card className="chatBox">
        {currentChat ? (
          <>
            {/* Top banner */}
            <div className="chatBoxHeader">
              <Avatar src={chatUser?.ProfilePic || "default-profile.png"} size={40} />
              <Text className="chatBoxHeaderName">{chatUser ? `${chatUser.FirstName} ${chatUser.LastName}` : 'Loading...'}</Text>
            </div>

            <div className="chatBoxTop">
              {messages.map((m) => (
                <div ref={scrollRef}>
                  <Message message={m} own={m.senderId === userId} profileImage={m.senderProfileImage} />
                </div>
              ))}
            </div>
            <div className="chatBoxBottom">
              <TextArea
                className="chatMessageInput"
                placeholder="Write something..."
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                rows={4}
              />
              <Button type="primary" className="chatSubmitButton" onClick={handleSubmit}>
                Send
              </Button>
            </div>
          </>
        ) : (
          <Text className="noConversationText">Open a conversation to start a chat.</Text>
        )}
      </Card>

      <Card className="chatOnline">
        <ChatOnline onlineUsers={onlineUsers} currentId={userId} setCurrentChat={setCurrentChat} />
      </Card>
    </div>
  );
}

export default Messenger;
