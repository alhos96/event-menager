import "./createEvent.css";
import React, { useState, useEffect } from "react";
import { Box, MenuItem, Typography, TextField, Button, Fade } from "@mui/material";
import DateAdapter from "@mui/lab/AdapterLuxon";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import axios from "axios";
import { categories } from "../../helpers";
import { useNavigate } from "react-router-dom";

function CreateEvent({ socket, setUrl }) {
  //helpers
  const navigate = useNavigate();

  //global state
  const token = sessionStorage.getItem("token");

  //local state
  const [file, setFile] = useState("");
  const [img, setImg] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(2.0);
  const [date, setDate] = useState(new Date("2021-12-28"));
  const [category, setCategory] = useState("");
  const [fade, setFade] = useState(false);

  //function
  function createEvent() {
    const newEvent = new FormData();

    newEvent.append("img", img);
    newEvent.append("title", title);
    newEvent.append("description", description);
    newEvent.append("price", price);
    newEvent.append("date", date);
    newEvent.append("category", category);

    axios
      .post("http://localhost:5000/events/create-event", newEvent, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        socket.emit("eventCreated", { myEvent: res.data.data, creator: res.data.data.creator });
        navigate("/dashboard");
      });
  }
  const dateChange = (newValue) => {
    setDate(newValue);
  };

  //side effects
  useEffect(() => {
    setFade(true);
    setUrl(window.location.pathname);
  }, []);

  return (
    <Fade in={fade} timeout={{ enter: 1000 }}>
      <Box className="CreateEvent">
        {file && <img id="uploaded-image" src={file} alt="uploaded"></img>}
        <Box
          onSubmit={(e) => {
            e.preventDefault();
            createEvent();
          }}
          component="form"
          enctype="multipart/form-data"
          fullWidth
        >
          <label className="upload-photo" htmlFor="img">
            {!file && <CameraAltOutlinedIcon color="primary" className="camera-icon" />}
            <Typography className="upload-photo-title" variant="body2" color="primary">
              {!file ? "Upload Photo" : "Choose Different?"}
            </Typography>

            <input
              style={{ display: "none" }}
              onChange={(e) => {
                setFile(URL.createObjectURL(e.target.files[0]));
                setImg(e.target.files[0]);
              }}
              id="img"
              type="file"
              name="img"
            />
          </label>
          <br></br>
          <TextField
            sx={{ mt: 1 }}
            onChange={(e) => setTitle(e.target.value)}
            name="title"
            label="Title"
            type="text"
            size="small"
            fullWidth
            required
          />
          <br></br>
          <TextField
            sx={{ mt: 1 }}
            onChange={(e) => setDescription(e.target.value)}
            name="description"
            label="Event Description"
            type="text"
            size="small"
            fullWidth
            required
          />
          <br></br>
          <TextField
            sx={{ mt: 1, mb: 1 }}
            onChange={(e) => setPrice(e.target.value)}
            name="price"
            label="Event Price"
            type="number"
            size="small"
            fullWidth
            required
          />
          <br></br>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DesktopDatePicker
              sx={{ mt: 1 }}
              /*  onChange={(e) => setDate(e.target.value)} */
              onChange={dateChange}
              name="date"
              label="Event Date"
              inputFormat="dd/MM/yyyy"
              size="small"
              value={date}
              fullWidth
              required
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>

          <br></br>
          <TextField
            select
            sx={{ mt: 1, textAlign: "left" }}
            onChange={(e) => setCategory(e.target.value)}
            name="category"
            label="Category"
            type="text"
            size="small"
            fullWidth
            required
            value={category}
          >
            {categories.map((cat, i) => {
              return (
                <MenuItem value={cat} key={i}>
                  {cat}
                </MenuItem>
              );
            })}
          </TextField>
          <br></br>
          <Button sx={{ mt: 2 }} variant="contained" disableElevation type="submit" children="create event" fullWidth />
          <Button
            sx={{ mt: 1 }}
            onClick={() => {
              navigate("/dashboard");
            }}
            variant="contained"
            color="secondary"
            disableElevation
            children="cancel"
            fullWidth
          />
        </Box>
      </Box>
    </Fade>
  );
}

export default CreateEvent;
