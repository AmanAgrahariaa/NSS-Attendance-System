import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import { backend_url } from "./services";

function Home() {
  const [AttendanceData, setAttendanceData] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [pastEventEntries, setPastEventEnteries] = useState(null);
  const [activeEventsEnteries, setActiveEventsEnteries] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${backend_url}/showEvents`);
      const responseData = await response.json();

      setAttendanceData(responseData);

      const ActivedisplayedEntries = responseData.filter(
        (event) => new Date(event.endDate) >= new Date()
      );

      setActiveEventsEnteries(ActivedisplayedEntries);
      const PastdislayedEnteries = responseData.filter(
        (event) => new Date(event.endDate) < new Date()
      );

      setPastEventEnteries(PastdislayedEnteries);
      setFilteredEntries(PastdislayedEnteries);
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
    const totalPages = Math.ceil(filteredEntries.length / entriesToShow);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery === "") {
      setFilteredEntries(pastEventEntries);
    } else {
      const filteredData = pastEventEntries.filter((event) =>
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
      setFilteredEntries(pastEventEntries);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(e);
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

  //   const entriesPerPage = entriesToShow;
  const dataLength = filteredEntries.length;
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

  const handleReportClickActive = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(activeEventsEnteries);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Active Event List Report"
    );
    const timestamp = Date.now();
    XLSX.writeFile(workbook, `admin_report_${timestamp}.xlsx`);
  };

  const handleReportClickPast = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(pastEventEntries);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Past Event List Report");
    const timestamp = Date.now();
    XLSX.writeFile(workbook, `admin_report_${timestamp}.xlsx`);
  };

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-6">
          <h2>Upcoming and Running Events</h2>
        </div>
        <div className="col-6 d-flex align-items-center justify-content-end">
          <Button
            variant="secondary"
            onClick={handleReportClickActive}
            style={{ marginRight: "10px" }}
          >
            Report
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Sno</th>
              <th>Event Name</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {activeEventsEnteries.map((event, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                }}
              >
                <td>{indexOfFirstEntry + index + 1}</td>

                <td>
                  <Link to={`/showCurrentEvent/${event._id}`}>
                    {event.eventName}
                  </Link>
                </td>
                <td>{formatDate(event.startDate)}</td>
                <td>{formatDate(event.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row mt-5">
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

        <div className="col-sm-6 d-flex align-items-center justify-content-end">
          <div className="d-flex flex-wrap justify-content-end align-items-center">
            <Button variant="secondary" onClick={handleReportClickPast}>
              Report
            </Button>
          </div>
        </div>
      </div>

      <div className="row mb-4 mt-3">
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
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Sno</th>
              <th>Event Name</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {displayedEntries.map((event, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                }}
              >
                <td>{indexOfFirstEntry + index + 1}</td>

                <td>
                  <Link to={`/showPastEvent/${event._id}`}>
                    {event.eventName}
                  </Link>
                </td>

                <td>{formatDate(event.startDate)}</td>
                <td>{formatDate(event.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-footer">
        <div className="container">
          <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="mb-2">
                Showing <b>{displayedEntries.length}</b> out of{" "}
                <b>{pastEventEntries.length}</b> entries
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
  );
}

export default Home;
