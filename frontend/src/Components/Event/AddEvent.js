import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
// import Home from '../Home';
import moment from "moment-timezone";
import { backend_url } from "../services";

const NewEventForm = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formError, setFormError] = useState("");

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      setFormError("Please fill in all fields.");
      return;
    }

    // Convert start and end dates to Indian Standard Time (IST)
    const indiaTimeZone = "Asia/Kolkata";
    const format = "YYYY-MM-DDTHH:mm";
    const convertedStartDate = moment
      .tz(startDate, format, indiaTimeZone)
      .format();
    const convertedEndDate = moment.tz(endDate, format, indiaTimeZone).format();

    console.log(
      "date time : " + convertedStartDate + " to " + convertedEndDate
    );

    try {
      const response = await fetch(`${backend_url}/addEvent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          startDate: convertedStartDate,
          endDate: convertedEndDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  if (isLoggedIn) {
    window.location.href = "/";
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <h2 className="text-center">New Event Form</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={handleNameChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicStartDate">
              <Form.Label>Start Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={startDate}
                onChange={handleStartDateChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicEndDate">
              <Form.Label>End Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endDate}
                onChange={handleEndDateChange}
                required
              />
            </Form.Group>

            {formError && <p className="text-danger">{formError}</p>}

            <Button variant="primary" type="submit">
              Create Event
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default NewEventForm;
