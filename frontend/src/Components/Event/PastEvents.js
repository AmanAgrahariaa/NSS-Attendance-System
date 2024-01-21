import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import moment from "moment-timezone";
import { backend_url } from "../services";

// import * as XLSX from 'xlsx';

const AdminHeader = () => {
  const [AttendanceData, setAttendanceData] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState(null);
  const [PastEventsEnteries, setPastEventsEnteries] = useState(null);

  // const [showModal, setShowModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedAdminIdToDelete, setSelectedAdminIdToDelete] = useState("");
  const [isEditButtonModalOpen, setIsEditButtonModalOpen] = useState(false);
  const [selectedEventIdToEdit, setSelectedEventIdToEdit] = useState("");
  const [formDataInEditModel, setFormDataInEditModel] = useState({});

  const initialState = {
    name: "",
    startDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${backend_url}/showEvents`);
      const responseData = await response.json();
      setAttendanceData(responseData);
      const ActivedisplayedEntries = responseData.filter(
        (event) => new Date(event.endDate) < new Date()
      );
      setPastEventsEnteries(ActivedisplayedEntries);
      setFilteredEntries(ActivedisplayedEntries);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (AttendanceData === null) {
    return <div>Loading...</div>;
  }

  const handleEntriesToShowChange = (event) => {
    setEntriesToShow(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const dataLength = filteredEntries ? filteredEntries.length : 0;
  const totalPages = Math.ceil(dataLength / entriesToShow);
  const indexOfLastEntry = currentPage * entriesToShow;
  const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  const displayedEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const pageLinks = [];
  for (let page = 1; page <= totalPages; page++) {
    pageLinks.push(
      <li
        className={`page-item ${currentPage === page ? "active" : ""}`}
        aria-current="page"
        key={page}
      >
        <a className="page-link" href="#" onClick={() => setCurrentPage(page)}>
          {page}
        </a>
      </li>
    );
  }

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata", // Indian Standard Time (IST) time zone
    };

    const formattedDateTime = dateTime.toLocaleString("en-US", options);

    return formattedDateTime;
  };

  const formatDate = (dateString) => {
    console.log(dateString);
    return formatDateTime(dateString);
  };

  const formatDateTimePickerEdiit = (dateTimeString) => {
    const indiaTimeZone = "Asia/Kolkata";
    const format = "YYYY-MM-DDTHH:mm"; // Format for datetime-local input
    const convertedDateTime = moment
      .tz(dateTimeString, indiaTimeZone)
      .format(format);
    return convertedDateTime;
  };

  // search related
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery === "") {
      setFilteredEntries(PastEventsEnteries);
    } else {
      const filteredData = PastEventsEnteries.filter((event) =>
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filteredData);
    }
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value === "") {
      setFilteredEntries(PastEventsEnteries);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(e);
  };

  // delete button
  // delete model
  const handleConfirmationModalToggle = () => {
    setIsConfirmationModalOpen(!isConfirmationModalOpen);
  };

  const handleDelete = async () => {
    try {
      // Send DELETE request to delete admin from the database
      await fetch(`${backend_url}/deleteEvent/${selectedAdminIdToDelete}`, {
        method: "DELETE",
      });

      // Refresh delete data
      fetchData();
    } catch (error) {
      console.log("Error deleting event:", error);
    }

    // Close the confirmation modal
    handleConfirmationModalToggle();
  };

  const handleConfirmation = (eventId) => {
    setSelectedAdminIdToDelete(eventId);
    handleConfirmationModalToggle();
  };

  // edit button model
  const handleEditButtonModalToggle = () => {
    setIsEditButtonModalOpen(!isEditButtonModalOpen);
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    console.log(formDataInEditModel);

    try {
      await fetch(`${backend_url}/updateEvent/${selectedEventIdToEdit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataInEditModel),
      });
      // Refresh event data
      fetchData();
    } catch (error) {
      console.log("Error updating event:", error);
    }
    // Close the confirmation modal
    handleEditButtonModalToggle();
  };

  const handleEditButton = (eventId) => {
    setSelectedEventIdToEdit(eventId);
    const selectedEventData = displayedEntries.find(
      (event) => event._id === eventId
    );
    console.log(selectedEventData);
    setFormDataInEditModel(selectedEventData);
    handleEditButtonModalToggle();
  };

  const handleInputChangeInEditModel = (e) => {
    // console.log(e.target.value);
    setFormDataInEditModel({
      ...formDataInEditModel,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {/* <Navbar/> */}
      <div
        className="d-flex align-items-start justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="container">
          <div className="row mb-4">
            <div className="col-sm-6 d-flex align-items-center">
              <div
                className="dataTables_length bs-select"
                id="dtBasicExample_length"
              >
                <div className="d-flex align-items-center">
                  <h2 className="mr-auto">Past Events</h2>
                </div>
              </div>
            </div>
          </div>

          {/* <Admin_Navbar/>  */}
          <div className="row mb-4">
            <div className="col-sm-6 d-flex align-items-center">
              <div
                className="dataTables_length bs-select"
                id="dtBasicExample_length"
              >
                <div className="d-flex align-items-center">
                  <label className="mb-0 mr-2">Show</label>
                  <select
                    name="dtBasicExample_length"
                    aria-controls="dtBasicExample"
                    className="custom-select custom-select-sm form-control form-control-sm"
                    style={{ width: "auto" }}
                    value={entriesToShow}
                    onChange={handleEntriesToShowChange}
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    {/* <option value="100">100</option> */}
                  </select>
                  <label className="mb-0 ml-2">entries</label>
                </div>
              </div>
            </div>

            <div className="col-sm-6 d-flex align-items-center justify-content-end">
              <form className="form-inline" onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    aria-label="Search"
                    style={{ width: "200px" }}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped" id="userTable">
              <thead>
                <tr>
                  <th>Sno</th>
                  <th>Event Name</th>
                  <th>Start Date Time</th>
                  <th>End Date Time</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody id="tbody">
                {displayedEntries.map((student, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstEntry + index + 1}</td>
                    <td>
                      <Link to={`/showCurrentEvent/${student._id}`}>
                        {student.eventName}
                      </Link>
                    </td>
                    <td>{formatDate(student.startDate)}</td>
                    <td>{formatDate(student.endDate)}</td>

                    <td>
                      <PencilFill
                        size={24}
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => handleEditButton(student._id)}
                      />
                    </td>
                    <td>
                      <TrashFill
                        size={24}
                        style={{ color: "red" }}
                        onClick={() => handleConfirmation(student._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Confirmation Modal */}
            <Modal
              show={isConfirmationModalOpen}
              onHide={handleConfirmationModalToggle}
            >
              <Modal.Header closeButton>
                <Modal.Title>Delete Current Event</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this event?
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={handleConfirmationModalToggle}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal
              show={isEditButtonModalOpen}
              onHide={handleEditButtonModalToggle}
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit Admin</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Modal content goes here */}
                <form onSubmit={handleEdit}>
                  {/* Form fields */}
                  <div className="form-group">
                    <label htmlFor="eventName">Event Name</label>
                    <input
                      type="text"
                      id="eventName"
                      className="form-control"
                      name="eventName"
                      value={formDataInEditModel.eventName}
                      onChange={handleInputChangeInEditModel}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="startDate">Event Start Date</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      class="form-control"
                      name="startDate"
                      value={formatDateTimePickerEdiit(
                        formDataInEditModel.startDate
                      )}
                      onChange={handleInputChangeInEditModel}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">Event End Date</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      class="form-control"
                      name="endDate"
                      value={formatDateTimePickerEdiit(
                        formDataInEditModel.endDate
                      )}
                      onChange={handleInputChangeInEditModel}
                    />
                  </div>

                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={handleEditButtonModalToggle}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Edit
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal.Body>
            </Modal>

            <div className="panel-footer">
              <div className="container">
                <div className="row">
                  <div className="col-12 d-flex justify-content-between align-items-center">
                    <div className="mb-2">
                      Showing <b>{displayedEntries.length}</b> out of{" "}
                      <b>{PastEventsEnteries.length}</b> entries
                    </div>
                    <ul className="pagination">
                      <li className="page-item" onClick={handlePreviousPage}>
                        <a className="page-link" href="#">
                          Previous
                        </a>
                      </li>
                      {pageLinks}
                      <li className="page-item" onClick={handleNextPage}>
                        <a className="page-link" href="#">
                          Next
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
