import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { backend_url } from "../services";

const AdminHeader = () => {
  const [AttendanceData, setAttendanceData] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedAdminIdToDelete, setSelectedAdminIdToDelete] = useState("");
  const [isEditButtonModalOpen, setIsEditButtonModalOpen] = useState(false);
  const [selectedAdminIdToEdit, setSelectedAdminIdToEdit] = useState("");
  const [formDataInEditModel, setFormDataInEditModel] = useState([]);
  const [formError, setFormError] = useState("");

  const initialState = {
    name: "",
    registrationNumber: "",
    email: "",
    adminType: "",
    position: "",
    course: "",
    branch: "",
    year: "",
  };

  const [formData, setFormData] = useState(initialState);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${backend_url}/showAdmins`);
      const responseData = await response.json();
      setAttendanceData(responseData);
      setFilteredEntries(responseData);
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

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleInputChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [name]: value,
      };
    });
  };

  // model submit for add
  async function handleSubmit(event) {
    event.preventDefault();

    // Check if any field is empty
    if (
      !formData.name ||
      !formData.registrationNumber ||
      !formData.email ||
      !formData.position ||
      !formData.adminType ||
      !formData.course ||
      !formData.branch ||
      !formData.year
    ) {
      console.log("Please fill in all fields.");
      setFormError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${backend_url}/addAdmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("Response from backend:", data);

      handleModalToggle();
      setFormData(initialState);
      fetchData();
    } catch (error) {
      console.log("Error sending data to backend:", error);
    }
  }

  const handleReportClick = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(AttendanceData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Report");
    const timestamp = Date.now();
    XLSX.writeFile(workbook, `admin_report_${timestamp}.xlsx`);
  };

  // search related
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery === "") {
      setFilteredEntries(AttendanceData);
    } else {
      const filteredData = AttendanceData.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.registrationNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filteredData);
    }
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value === "") {
      setFilteredEntries(AttendanceData);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(e);
  };

  // delete model
  const handleConfirmationModalToggle = () => {
    setIsConfirmationModalOpen(!isConfirmationModalOpen);
  };

  // edit button model
  const handleEditButtonModalToggle = () => {
    setIsEditButtonModalOpen(!isEditButtonModalOpen);
  };

  const handleDelete = async () => {
    try {
      // Send DELETE request to delete admin from the database
      await fetch(`${backend_url}/deleteAdmin/${selectedAdminIdToDelete}`, {
        method: "DELETE",
      });

      // Refresh admin data
      fetchData();
    } catch (error) {
      console.log("Error deleting admin:", error);
    }

    // Close the confirmation modal
    handleConfirmationModalToggle();
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    console.log(formDataInEditModel);
    try {
      // Send edit / update request to update admin from the database
      await fetch(`${backend_url}/updateAdmin/${selectedAdminIdToEdit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataInEditModel),
      });

      // Refresh admin data
      fetchData();
    } catch (error) {
      console.log("Error updating admin:", error);
    }

    // Close the confirmation modal
    handleEditButtonModalToggle();
  };

  const handleConfirmation = (adminId) => {
    setSelectedAdminIdToDelete(adminId);
    handleConfirmationModalToggle();
  };

  const handleEditButton = (adminId) => {
    setSelectedAdminIdToEdit(adminId);
    const selectedAdminData = displayedEntries.find(
      (admin) => admin._id === adminId
    );
    setFormDataInEditModel(selectedAdminData);
    handleEditButtonModalToggle();
  };

  const handleInputChangeInEditModel = (e) => {
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
                  <h2 className="mr-auto">Admin List</h2>
                </div>
              </div>
            </div>

            <div className="col-sm-6 d-flex align-items-center justify-content-end">
              <div className="d-flex ml-auto">
                <Button
                  variant="secondary"
                  onClick={handleReportClick}
                  style={{ marginRight: "10px" }}
                >
                  Report
                </Button>
                <Button variant="primary" onClick={handleModalToggle}>
                  Add
                </Button>
              </div>
            </div>

            {/* Add Admin Model*/}
            <Modal show={showModal} onHide={handleModalToggle}>
              <Modal.Header closeButton>
                <Modal.Title>Add Admin</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* const {name, registrationNumber, email,  adminType, course, branch, year} = req.body; */}

                {/* Modal content goes here */}
                <form onSubmit={handleSubmit}>
                  {/* Form fields */}
                  <div className="form-group">
                    <label htmlFor="name">Admin Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registrationNumber">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* <div className="form-group">
                                        <label htmlFor="password">password</label>
                                        <input type="password" className="form-control" id="password" name="password" value={formDataInEditModel.password} onChange={handleInputChangeInEditModel} />
                                    </div> */}

                  <div className="form-group mb-2 mt-2">
                    <label>AdminType</label>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="Admin1"
                            name="adminType"
                            value="Admin1"
                            onChange={handleInputChange}
                            style={{
                              appearance: "auto",
                              width: "1.2em",
                              height: "1.2em",
                              backgroundColor: "#6f42c1",
                            }}
                          />
                          <label className="form-check-label" htmlFor="Admin1">
                            Admin1
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="Admin2"
                            name="adminType"
                            value="Admin2"
                            onChange={handleInputChange}
                            style={{
                              appearance: "auto",
                              width: "1.2em",
                              height: "1.2em",
                              backgroundColor: "#6f42c1",
                            }}
                          />
                          <label className="form-check-label" htmlFor="Admin2">
                            Admin2
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="position">Position</label>
                    <select
                      className="form-control"
                      id="position"
                      onChange={handleInputChange}
                      name="position"
                      value={formData.position}
                    >
                      <option value="">Select Position</option>
                      <option value="president">President</option>
                      <option value="vice-president">Vice President</option>
                      <option value="em-head">EM Head</option>
                      <option value="creative-head">Creative Head</option>
                      <option value="content-head">Content Head</option>
                      <option value="pr-head">PR Head</option>
                      <option value="strategic-planning-head">
                        strategic & Planning Head
                      </option>
                      <option value="media-head">Media Head</option>
                      <option value="web-head">Web Head</option>
                      <option value="pg-representative">
                        PG Representative
                      </option>
                      <option value="general-secratary">
                        General Secratary
                      </option>
                      <option value="joint-secratary">Join Secratory</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="course">Course</label>
                    <select
                      className="form-control"
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Course</option>
                      <option value="B-tech">B-Tech</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Sc.">M.Sc.</option>
                      <option value="M-Tech">M-Tech</option>
                      <option value="Ph.D.">Ph.D.</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="branch">Branch</label>
                    <select
                      className="form-control"
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Branch</option>
                      <option value="MCA">MCA</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Civil">Civil</option>
                      <option value="Mathematics">Mathematics</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <select
                      className="form-control"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Year</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                    </select>
                  </div>

                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalToggle}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Add
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal.Body>
            </Modal>
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
                    <option value="100">100</option>
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
                  <th>Admin Name</th>
                  <th>Registration No</th>
                  <th>Position</th>
                  <th>AdminType</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody id="tbody">
                {displayedEntries.map((student, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstEntry + index + 1}</td>
                    <td>{student.name}</td>
                    <td>{student.registrationNumber}</td>
                    <td>{student.position}</td>
                    <td>{student.adminType}</td>
                    <td>
                      <PencilFill
                        size={24}
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => handleEditButton(student._id)}
                      />
                      {/* <PencilFill size={24} style={{ color: 'blue', cursor: 'pointer' }} onClick={handleEdit} /> */}
                    </td>
                    <td>
                      <TrashFill
                        size={24}
                        style={{ color: "red" }}
                        onClick={() => handleConfirmation(student._id)}
                      />
                      {/* <TrashFill size={24} style={{ color: 'red', cursor: 'pointer' }} onClick={handleDelete} /> */}
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
                <Modal.Title>Delete Admin</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this admin?
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
                    <label htmlFor="name">Admin Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formDataInEditModel.name}
                      onChange={handleInputChangeInEditModel}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registrationNumber">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formDataInEditModel.registrationNumber}
                      onChange={handleInputChangeInEditModel}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formDataInEditModel.email}
                      onChange={handleInputChangeInEditModel}
                    />
                  </div>

                  {/* <div className="form-group">
                                        <label htmlFor="password">password</label>
                                        <input type="password" className="form-control" id="password" name="password" value={formDataInEditModel.password} onChange={handleInputChangeInEditModel} />
                                    </div> */}

                  <div className="form-group mb-2 mt-2">
                    <label>AdminType</label>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="Admin1"
                            name="adminType"
                            value="Admin1"
                            checked={formDataInEditModel.adminType === "Admin1"}
                            onChange={handleInputChangeInEditModel}
                            style={{
                              appearance: "auto",
                              width: "1.2em",
                              height: "1.2em",
                              backgroundColor: "#6f42c1",
                            }}
                          />
                          <label className="form-check-label" htmlFor="Admin1">
                            Admin1
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="Admin2"
                            name="adminType"
                            value="Admin2"
                            checked={formDataInEditModel.adminType === "Admin2"}
                            onChange={handleInputChangeInEditModel}
                            style={{
                              appearance: "auto",
                              width: "1.2em",
                              height: "1.2em",
                              backgroundColor: "#6f42c1",
                            }}
                          />
                          <label className="form-check-label" htmlFor="Admin2">
                            Admin2
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="position">Position</label>
                    <select
                      className="form-control"
                      id="position"
                      onChange={handleInputChangeInEditModel}
                      name="position"
                      value={formDataInEditModel.position}
                    >
                      <option value="">Select Position</option>
                      <option value="president">President</option>
                      <option value="vice-president">Vice President</option>
                      <option value="em-head">EM Head</option>
                      <option value="creative-head">Creative Head</option>
                      <option value="content-head">Content Head</option>
                      <option value="pr-head">PR Head</option>
                      <option value="strategic-planning-head">
                        strategic & Planning Head
                      </option>
                      <option value="media-head">Media Head</option>
                      <option value="web-head">Web Head</option>
                      <option value="pg-representative">
                        PG Representative
                      </option>
                      <option value="general-secratary">
                        General Secratary
                      </option>
                      <option value="joint-secratary">Join Secratory</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="course">Course</label>
                    <select
                      className="form-control"
                      id="course"
                      name="course"
                      value={formDataInEditModel.course}
                      onChange={handleInputChangeInEditModel}
                    >
                      <option value="">Select Course</option>
                      <option value="B-tech">B-Tech</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Sc.">M.Sc.</option>
                      <option value="M-Tech">M-Tech</option>
                      <option value="Ph.D.">Ph.D.</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="branch">Branch</label>
                    <select
                      className="form-control"
                      id="branch"
                      name="branch"
                      value={formDataInEditModel.branch}
                      onChange={handleInputChangeInEditModel}
                    >
                      <option value="">Select Branch</option>
                      <option value="MCA">MCA</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Civil">Civil</option>
                      <option value="Mathematics">Mathematics</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <select
                      className="form-control"
                      id="year"
                      name="year"
                      value={formDataInEditModel.year}
                      onChange={handleInputChangeInEditModel}
                    >
                      <option value="">Select Year</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                      {/* Add more options as needed */}
                    </select>
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
                      <b>{AttendanceData.length}</b> entries
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
