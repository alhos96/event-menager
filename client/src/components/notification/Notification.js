import "./notification.css";
import { Slide, Typography, Divider, Button, ButtonGroup, Box } from "@mui/material";
import { methods, postSomething } from "../../helpers";

function Notification({ notification, setNotification, displayNotification, setDisplayNotification }) {
  //global state
  let token = sessionStorage.getItem("token");

  //helpers
  let { put } = methods;

  return (
    <Slide direction="down" in={displayNotification}>
      <Box className="notification-wrapp">
        <Box className="notification">
          <Typography gutterBottom variant="body2" color="text.secondary">
            <span className="small-title">{notification.email}</span> wants to register to your{" "}
            <span className="small-title">{notification.eventTitle}</span> event.
          </Typography>
          <Divider sx={{ mb: 1, mt: 1 }}></Divider>

          <ButtonGroup disableElevation fullWidth>
            <Button
              id={notification.eventId}
              variant="contained"
              onClick={(e) => {
                postSomething(
                  put,
                  "/events/registration-answer",
                  { eventId: e.target.id, email: notification.email, answer: "Accepted" },
                  token,
                  setNotification
                );
                setDisplayNotification(false);
              }}
            >
              Accept
            </Button>
            <Button
              id={notification.eventId}
              onClick={(e) => {
                postSomething(
                  put,
                  "/events/registration-answer",
                  { eventId: e.target.id, email: notification.email, answer: "Rejected" },
                  token,
                  setNotification
                );
                setDisplayNotification(false);
              }}
              variant="contained"
              color="secondary"
            >
              Reject
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Slide>
  );
}

export default Notification;
