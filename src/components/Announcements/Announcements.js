
import AnnouncementForm from "./AnnouncementsForm";

const Announcement = ({refreshFlag}) => {

  
    return (
      <div>
        <AnnouncementForm refreshFlag={refreshFlag} /> 
      </div>
    );
};


export default Announcement