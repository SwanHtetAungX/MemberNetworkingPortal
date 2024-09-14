import { useEffect, useState } from "react";
import "./chatOnline.css";
import axios from "axios";

function ChatOnline({ onlineUsers, currentId, setCurrentChat }) {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);

  useEffect(() => {
    //http://localhost:5050/connection/connections/:id
    const getFriends = async () => {
      const res = await axios.get(
        "http://localhost:5050/connection/connections/" + currentId
      );
      setFriends(res.data);
    };
    getFriends();
  }, [currentId]);



  useEffect(() => {
    setOnlineFriends(
        friends.filter((f) => {
            const friendId = f.userID1 === currentId ? f.userID2 : f.userID1; // Identify the friend
            return onlineUsers.some((u) => u.userId === friendId); // Check if the friend is online
        })
    );
}, [friends, onlineUsers, currentId]);


  const handleClick = async (user) => {
    try {
      console.log(user);
      const res = await axios.get(
        `http://localhost:5050/conversation/find/${currentId}/${user.userID2}`
      );
      setCurrentChat(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatOnline">
      {onlineFriends.map((o) => (
        <div className="chatOnlineFriend" onClick={() => handleClick(o)}>
          <div className="chatOnlineImgContainer">
            <img
              className="chatOnlineImg"
              src={o.connectedUser.ProfilePic}
              alt=""
            />

            <div className="chatOnlineBadge"></div>
          </div>
          {`${o.connectedUser.FirstName} ${o.connectedUser.LastName}`}
        </div>
      ))}
    </div>
  );
}

export default ChatOnline;
