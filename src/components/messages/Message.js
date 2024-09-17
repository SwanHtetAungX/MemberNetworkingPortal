// import "./message.css";
// import { format } from "timeago.js";

// function Message({ message, own, profileImage }) {

    
//     return (
//         <div className={own ? "message own" : "message"}>
//             <div className="messageTop">
//                 <img 
//                     className="messageImg" 
//                     src={profileImage || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} // Show profileImage or fallback to default
//                     alt="Sender"
//                 />
//                 <p className="messageText">
//                     {message?.text || 'Loading...'}
//                 </p>
//             </div>
//             <div className="messageBottom">{format(message ? message.createdAt : 'Loading...')}</div>
//         </div>
//     );
// }

// export default Message;

import "./message.css";
import { Avatar, Typography } from "antd";
import { format } from "timeago.js";

const { Text } = Typography;

function Message({ message, own, profileImage }) {
  return (
    <div className={own ? "message own" : "message"}>
      
      <div className="messageTop">
        <Avatar className="messageImg" src={profileImage} size={40} />
        <div className="messageContent">
          <Text className="messageText">{message?.text || 'Loading...'}</Text>
        </div>
      </div>
      <div className="messageBottom">{format(message?.createdAt)}</div>
    </div>

  );
}

export default Message;

