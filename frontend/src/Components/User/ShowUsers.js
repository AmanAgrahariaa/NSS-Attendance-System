import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Modal } from 'react-bootstrap';
import { PencilFill, TrashFill } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import { backend_url } from "../services";

const AdminHeader = () => {
    const [AttendanceData, setAttendanceData] = useState(null);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [finalEntries, setFinalEntries] = useState(null);
    const [entriesToShow, setEntriesToShow] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = React.useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [branchData, setBranchData] = useState('');
    const [yearData, setYearData] = useState('');
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedAdminIdToDelete, setSelectedAdminIdToDelete] = useState('');
    const [isEditButtonModalOpen, setIsEditButtonModalOpen] = useState(false);
    const [selectedMemberToEdit, setSelectedMemberIdToEdit] = useState('');
    const [formDataInEditModel, setFormDataInEditModel] = useState([]);

    const initialState = {
        name: '',
        registrationNumber: '',
        email: '',
        course: '',
        branch: '',
        year: ''
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${backend_url}/showUsers`);
            const responseData = await response.json();
            setAttendanceData(responseData);
            setFilteredEntries(responseData);
            setFinalEntries(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    if (!AttendanceData) {
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




    // filters

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
        if (value === '') {
            setFinalEntries(filteredEntries);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        if (searchQuery === '') {
            setFinalEntries(filteredEntries);
        } else {
            const filteredData = filteredEntries.filter((member) =>
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
    const filtered_Entries = finalEntries?.filter(entry => {
        // Check if the event filter is applied
        const eventFilterApplied = branchData !== '';
        if (eventFilterApplied && entry.branch !== branchData) {
            return false;
        }

        // Check if the year filter is applied
        const yearFilterApplied = yearData !== '';
        if (yearFilterApplied && entry.year !== yearData) {
            return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filtered_Entries.length / entriesToShow);
    const indexOfLastEntry = currentPage * entriesToShow;
    const indexOfFirstEntry = indexOfLastEntry - entriesToShow;

    // Get the displayed entries based on the filtered and sliced array
    const displayedEntries = filtered_Entries.slice(indexOfFirstEntry, indexOfLastEntry);



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




    // add member 

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





    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(`${backend_url}/addUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            console.log('Response from backend:', data);

            handleModalToggle();
            setFormData(initialState);
            fetchData();
        } catch (error) {
            console.log('Error sending data to backend:', error);
        }
    }



    // add member end









    // generate report 

    const handleReportClick = () => {
        // Call the function to generate the admin list PDF
        // generateAdminListPDF();
        // Create a new workbook
        const workbook = XLSX.utils.book_new();


        // Convert student data to worksheet format
        const worksheet = XLSX.utils.json_to_sheet(AttendanceData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Member Report');

        // Generate the Excel file
        const timestamp = Date.now();
        XLSX.writeFile(workbook, `member_report_${timestamp}.xlsx`);

    };





    // delete model
    const handleConfirmationModalToggle = () => {
        setIsConfirmationModalOpen(!isConfirmationModalOpen);
    };

    const handleDelete = async () => {
        try {
            // Send DELETE request to delete member from the database
            await fetch(`${backend_url}/deleteUser/${selectedAdminIdToDelete}`, {
                method: 'DELETE'
            });

            // Refresh member data
            fetchData();
        } catch (error) {
            console.log('Error deleting member:', error);
        }

        // Close the confirmation modal
        handleConfirmationModalToggle();
    };

    const handleConfirmation = (memberId) => {
        setSelectedAdminIdToDelete(memberId);
        handleConfirmationModalToggle();
    };



     // edit button model
     const handleEditButtonModalToggle = () => {
        setIsEditButtonModalOpen(!isEditButtonModalOpen);
    };

    const handleEdit = async (event) => {
        event.preventDefault()
        try {
            // Send edit / update request to update member from the database
            await fetch(`${backend_url}/updateUser/${selectedMemberToEdit}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataInEditModel),
            });

            // Refresh member data
            fetchData();
        } catch (error) {
            console.log('Error updating member:', error);
        }

        // Close the confirmation modal
        handleEditButtonModalToggle();
    };


    const handleEditButton = (memberId) => {
        setSelectedMemberIdToEdit(memberId);
        const selectedMemberData = displayedEntries.find((member) => member._id === memberId);
        setFormDataInEditModel(selectedMemberData);
        handleEditButtonModalToggle();
    };

    const handleInputChangeInEditModel = (e) => {
        setFormDataInEditModel({ ...formDataInEditModel, [e.target.name]: e.target.value });
    };


    return (

        <>
            {/* <Navbar/> */}
            <div className="d-flex align-items-start justify-content-center" style={{ minHeight: "100vh" }}>
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-sm-6 d-flex align-items-center">
                            <div className="dataTables_length bs-select" id="dtBasicExample_length">
                                <div className="d-flex align-items-center">
                                    <h2 className="mr-auto">Member List</h2>
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-6 d-flex align-items-center justify-content-end">
                            <div className="d-flex ml-auto">
                                <Button variant="secondary" onClick={handleReportClick} style={{ marginRight: '10px' }}>Report</Button>
                                <Button variant="primary" onClick={handleModalToggle}>Add</Button>
                            </div>
                        </div>

                        {/* model for add student */}
                        <Modal show={showModal} onHide={handleModalToggle}>
                            <Modal.Header closeButton>
                                <Modal.Title>Add Student</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {/* Modal content goes here */}
                                {/* {name, registrationNumber, email, course, branch, year}  */}
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="name">Student Name</label>
                                        <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="registrationNumber">Registration Number</label>
                                        <input type="text" className="form-control" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email </label>
                                        <input type="text" className="form-control" id="email" name="email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="course">Course</label>
                                        <select className="form-control" id="course" name="course" value={formData.course} onChange={handleInputChange}>
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
                                        <select className="form-control" id="branch" name="branch" value={formData.branch} onChange={handleInputChange}>
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
                                        <select className="form-control" id="year" name="year" value={formData.year} onChange={handleInputChange}>
                                            <option value="">Select Year</option>
                                            <option value="1st">1st</option>
                                            <option value="2nd">2nd</option>
                                            <option value="3rd">3rd</option>
                                            <option value="4th">4th</option>
                                            {/* Add more options as needed */}
                                        </select>
                                    </div>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleModalToggle}>Cancel</Button>
                                        <Button variant="primary" type="submit">Add</Button>
                                    </Modal.Footer>
                                </form>
                            </Modal.Body>
                        </Modal>


                        {/* end of model for add student */}
                    </div>















                    <div className="row mb-4">
                        <div className="col-sm-6">
                            <div className="dataTables_length bs-select" id="dtBasicExample_length">
                                <div className="d-flex align-items-center">
                                    <h4 className="mr-auto">Add Filter</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-6 d-flex align-items-center justify-content-end">
                            <div className="d-flex flex-wrap">
                                <div className="form-group mr-2 mb-2">
                                    <select className="form-control" id="branch" name="branch" value={branchData} onChange={handleBranchChange}>
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
                                    <select className="form-control" id="year" name="year" value={yearData} onChange={handleYearChange}>
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



                    {/* <Admin_Navbar/>  */}
                    <div className="row mb-4">
                        <div className="col-sm-6 d-flex align-items-center">
                            <div className="dataTables_length bs-select" id="dtBasicExample_length">
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
                                        <option value="500">500</option>
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
                                    <th>Registration No</th>
                                    <th>Student Name</th>
                                    <th>Branch</th>
                                    <th>Batch(Year)</th>
                                    <th>Edit</th>
                                    <th>Delete</th>

                                </tr>
                            </thead>
                            <tbody id="tbody">
                                {displayedEntries && displayedEntries.length > 0 ? (
                                    displayedEntries.map((student, index) => (
                                        <tr key={index}>
                                            <td>{indexOfFirstEntry + index + 1}</td>
                                            <td>{student.registrationNumber}</td>
                                            <td>{student.name}</td>

                                            <td>{student.branch}</td>
                                            <td>{student.year}</td>

                                            <td>
                                                <PencilFill size={24} style={{ color: 'blue', cursor: 'pointer' }} onClick={() => handleEditButton(student._id)} />
                                                {/* <PencilFill size={24} style={{ color: 'blue', cursor: 'pointer' }} onClick={handleEdit} /> */}
                                            </td>
                                            <td>
                                                <TrashFill size={24} style={{ color: 'red' }} onClick={() => handleConfirmation(student._id)} />
                                                {/* <TrashFill size={24} style={{ color: 'red', cursor: 'pointer' }} onClick={handleDelete} /> */}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">No entries found</td>
                                    </tr>
                                )}

                            </tbody>
                        </table>

                        {/* Confirmation Modal */}
                        <Modal show={isConfirmationModalOpen} onHide={handleConfirmationModalToggle}>
                            <Modal.Header closeButton>
                                <Modal.Title>Delete Member</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Are you sure you want to delete this member?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleConfirmationModalToggle}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </Modal.Footer>
                        </Modal>


                         {/* Edit Modal */}
                         <Modal show={isEditButtonModalOpen} onHide={handleEditButtonModalToggle}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Member</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {/* Modal content goes here */}
                                <form onSubmit={handleEdit}>
                                    {/* Form fields */}
                                    <div className="form-group">
                                        <label htmlFor="name">Student Name</label>
                                        <input type="text" className="form-control" id="name" name="name" value={formDataInEditModel.name} onChange={handleInputChangeInEditModel} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="registrationNumber">Registration Number</label>
                                        <input type="text" className="form-control" id="registrationNumber" name="registrationNumber" value={formDataInEditModel.registrationNumber} onChange={handleInputChangeInEditModel} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email </label>
                                        <input type="text" className="form-control" id="email" name="email" value={formDataInEditModel.email} onChange={handleInputChangeInEditModel} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="course">Course</label>
                                        <select className="form-control" id="course" name="course" value={formDataInEditModel.course} onChange={handleInputChangeInEditModel}>
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
                                        <select className="form-control" id="branch" name="branch" value={formDataInEditModel.branch} onChange={handleInputChangeInEditModel}>
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
                                        <select className="form-control" id="year" name="year" value={formDataInEditModel.year} onChange={handleInputChangeInEditModel}>
                                            <option value="">Select Year</option>
                                            <option value="1st">1st</option>
                                            <option value="2nd">2nd</option>
                                            <option value="3rd">3rd</option>
                                            <option value="4th">4th</option>
                                            {/* Add more options as needed */}
                                        </select>
                                    </div>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleEditButtonModalToggle}>Cancel</Button>
                                        <Button variant="primary" type='submit'>Edit</Button>
                                    </Modal.Footer>
                                </form>
                            </Modal.Body>
                        </Modal>


                        <div className="panel-footer">
                            <div className="container">
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-between align-items-center">
                                        <div className="mb-2">
                                            Showing <b>{displayedEntries.length}</b> out of <b>{AttendanceData.length}</b> entries
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
                </div >
            </div >
        </>

    );
};

export default AdminHeader;


