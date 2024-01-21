import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import { Button, Modal } from "react-bootstrap";
// import { PencilFill, TrashFill } from 'react-bootstrap-icons';
import * as XLSX from "xlsx";
import { backend_url } from "../services";

const ShowEvent = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [userData, setUserData] = useState([]);
  // const [showModal, setShowModal] = React.useState(false);

  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchData, setBranchData] = useState("");
  const [yearData, setYearData] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [finalEntries, setFinalEntries] = useState(null);

  useEffect(() => {
    fetchEvent();
    fetchData();
  }, []);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${backend_url}/showEvents`);
      const data = await response.json();
      console.log(data);
      const event = data.find((event) => event._id === id);
      setEvent(event);
      console.log(event, "h");
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const fetchData = async () => {
    try{
      const response = await fetch(`${backend_url}/showUsers`);
      const data = await response.json();
      setUserData(data);
      setFilteredEntries(data);
      setFinalEntries(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleAttendance = async (userId, userEmail) => {
    try {
      const response = await fetch(`${backend_url}/takeAttendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: event.eventName,
          userEmail: userEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the attendance status
        setUserData((prevData) =>
          prevData.map((user) =>
            user._id === userId ? { ...user, attendance: "Present" } : user
          )
        );
      }

      // fetchEvent();
      fetchData();
    } catch (error) {
      console.error("Error taking attendance:", error);
    }
  };

  const handleDeleteAttendance = async (userId, userEmail) => {
    try {
      const response = await fetch(`${backend_url}/deleteAttendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: event.eventName,
          userEmail: userEmail,
        }),
      });

      const data = await response.json();

      // fetchEvent();
      fetchData();
    } catch (error) {
      console.log("Error in deleting attendance");
    }
  };

  if (userData === null) {
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

  const handleBranchChange = (event) => {
    const selectedBranch = event.target.value;
    setBranchData(selectedBranch);
    setCurrentPage(1);
  };

  const handleYearChange = (event) => {
    const selectedYear = event.target.value;
    setYearData(selectedYear);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value === "") {
      setFinalEntries(filteredEntries);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery === "") {
      setFinalEntries(filteredEntries);
    } else {
      const filteredData = filteredEntries.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.registrationNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFinalEntries(filteredData);
    }
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(e);
  };

  // Apply filters to get the filtered entries
  const filtered_Entries = finalEntries?.filter((entry) => {
    // Check if the event filter is applied
    const eventFilterApplied = branchData !== "";
    if (eventFilterApplied && entry.branch !== branchData) {
      return false;
    }

    // Check if the year filter is applied
    const yearFilterApplied = yearData !== "";
    if (yearFilterApplied && entry.year !== yearData) {
      return false;
    }

    return true;
  });

  const handleReportClick = () => {
    const workbook = XLSX.utils.book_new();
    // Create a new array to store modified data for Excel
    const dataForExcel = filtered_Entries.map((entry) => ({
      name: entry.name,
      registrationNumber: entry.registrationNumber,
      email: entry.email,
      branch: entry.branch,
      year: entry.year,
      status: entry.events?.includes(event.eventName) ? "Present" : "Absent",
    }));

    // Convert modified data to worksheet format
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    // Convert student data to worksheet format
    // const worksheet = XLSX.utils.json_to_sheet(filtered_Entries);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    // Generate the Excel file
    const timestamp = Date.now();
    XLSX.writeFile(workbook, `member_report_${timestamp}.xlsx`);
  };

  const dataLength = filtered_Entries ? filtered_Entries.length : 0;
  const totalPages = Math.ceil(dataLength / entriesToShow);
  const indexOfLastEntry = currentPage * entriesToShow;
  const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  // Get the displayed entries based on the filtered and sliced array
  // const displayedEntries = filtered_Entries.slice(indexOfFirstEntry, indexOfLastEntry);
  const displayedEntries =
    filtered_Entries && Array.isArray(filtered_Entries)
      ? filtered_Entries.slice(indexOfFirstEntry, indexOfLastEntry)
      : [];

  // const entriesPerPage = entriesToShow;
  // const totalPages = Math.ceil(dataLength / entriesToShow);
  // const indexOfLastEntry = currentPage * entriesToShow;
  // const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  // const displayedEntries = userData.slice(indexOfFirstEntry, indexOfLastEntry);

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

  return (
    <>
      {event && (
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={6}>
              <div>
                <h3 className="text-center">{event.eventName}</h3>
                <p className="text-center">
                  <strong>Start Date:</strong> {formatDate(event.startDate)}
                </p>
                <p className="text-center">
                  <strong>End Date:</strong> {formatDate(event.endDate)}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      )}
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
                  <h2 className="mr-auto text-center">Attendance List</h2>
                </div>
              </div>
            </div>

            <div className="col-sm-6 d-flex align-items-center justify-content-end">
              <div className="d-flex flex-wrap justify-content-end align-items-center">
                <Button variant="primary" onClick={handleReportClick}>
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-sm-6">
              <div
                className="dataTables_length bs-select"
                id="dtBasicExample_length"
              >
                <div className="d-flex align-items-center">
                  <h4 className="mr-auto">Add Filter</h4>
                </div>
              </div>
            </div>

            <div className="col-sm-6 d-flex align-items-center justify-content-end">
              <div className="d-flex flex-wrap">
                <div className="form-group mr-2 mb-2">
                  <select
                    className="form-control"
                    id="branch"
                    name="branch"
                    value={branchData}
                    onChange={handleBranchChange}
                  >
                    <option value="">Select Branch</option>
                    <option value="MCA">MCA</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Civil">Civil</option>
                    <option value="Mathematics">Mathematics</option>

                    {/* Add branch options here */}
                  </select>
                </div>
                <div className="form-group mr-2 mb-2">
                  <select
                    className="form-control"
                    id="year"
                    name="year"
                    value={yearData}
                    onChange={handleYearChange}
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="4th">4th</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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
                  </select>
                  <label className="mb-0 ml-2">entries</label>
                </div>
              </div>
            </div>

            {/* search box start */}
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
                  <th>Student Name</th>
                  <th>Registration No</th>
                  <th>Branch</th>
                  {/* <th>Participation</th> */}
                  <th>Batch(Year)</th>
                  <th>Attendance Status</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody id="tbody">
                {displayedEntries.map((student, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstEntry + index + 1}</td>
                    <td>{student.name}</td>
                    <td>{student.registrationNumber}</td>
                    <td>{student.course}</td>
                    <td>{student.year}</td>

                    <td>
                      <button
                        onClick={() =>
                          handleAttendance(student._id, student.email)
                        }
                        disabled={student.events.includes(event?.eventName)}
                      >
                        {student.events.includes(event?.eventName)
                          ? "Present"
                          : "Absent"}
                      </button>
                    </td>
                    <td>
                      {/* <TrashFill  size={24} style={{ color: 'red' }} /> */}
                      <button
                        onClick={() =>
                          handleDeleteAttendance(student._id, student.email)
                        }
                        disabled={!student.events.includes(event?.eventName)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="panel-footer">
              <div className="container">
                <div className="row">
                  <div className="col-12 d-flex justify-content-between align-items-center">
                    <div className="mb-2">
                      Showing <b>{displayedEntries.length}</b> out of{" "}
                      <b>{userData.length}</b> entries
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

export default ShowEvent;
