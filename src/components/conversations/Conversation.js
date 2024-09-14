import "./Conversation.css"
import {useContext, useEffect, useState} from "react";
import axios from "axios";
function Conversation({conversation, currentUser}) {
    const [user,setUser] = useState(null)

    useEffect(() => {
        const friendId = conversation.members.find((m) => m !== currentUser)

        const getUser = async () => {

            try {
                const res = await axios("http://localhost:5050/members/"+ friendId)
                setUser(res.data)
              
                
            } catch(err){
                console.log(err)
            }
            
        };
        getUser();

    }, [currentUser,conversation])
    return (
        <div className="conversation">
            <img className="conversationImg" src={user?.ProfilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt="" />
            {user ? `${user.FirstName} ${user.LastName}` : 'Loading...'}
        </div>
    )
}

export default Conversation;