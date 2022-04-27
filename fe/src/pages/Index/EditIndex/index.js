import React, { useEffect, useState } from "react";
import axios from "../../../helper/axios";
import { Button, NavItem } from "react-bootstrap";
import "./style.css";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import {
  CDBTableHeader,
  CDBTableBody,
  CDBTable,
  CDBBtn,
  CDBContainer,
  CDBCard,
  CDBCardBody,
  CDBDataTable,
} from "cdbreact";
import { CDBBreadcrumb } from "cdbreact";

const EditIndexPage = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [data, setData] = useState([]);
  const [size, setSize] = useState("20");
  const [dataTable, setDataTable] = useState([]);
  const [search, setSearch] = useState(false);
  const [scroll_id, setScrollId] = useState("");
  const { indexId } = params;
  const [textSearchRecord, setTextSearchRecord] = useState("");
  const [idDeleteRecord, setIdDeleteRecord] = useState("");
  const [searchby, setSearchBy] = useState("");
  async function getData() {
    let response = await axios.post(`/api/data/${indexId}`, { size: size });
    setData(response.data.hits);
    setScrollId(response.data._scroll_id);
    console.log(response);
  }
  async function SearchRecord() {
    let response = await axios.post(`/api/data/${indexId}`, {
      type: "multi-matching",
      operator: "or",
      size: size,
      [searchby]: textSearchRecord,
    });
    console.log(response);
    if (response.status === 200) {
      setData(response.data.hits);
      /* getDataTable(response.data.hits); */
      setScrollId(response.data._scroll_id);
      handleDataTable(response.data.hits.hits)

    }
  }
  async function DeleteRecord() {
    let response = await axios.delete(`/api/data/${indexId}/${idDeleteRecord}`);
    console.log(response);
    if (response.status === 200) {
      alert("xoá thành công");
      setIdDeleteRecord("");
      getData();
      getDataTable();
    }
  }
  async function DeleteRecord(id) {
    let response = await axios.delete(`/api/data/${indexId}/${id}`);
    console.log(response);
    if (response.status === 200) {
      alert("xoá thành công");
      setIdDeleteRecord("");
      getData();
      getDataTable();
    }
  }
  async function getDataTable() {
    let response = await axios.post(`/api/data/${indexId}`, { size: 20000 });
    const data = response.data.hits;
    console.log(data)
    handleDataTable(data.hits)
  }
  const handleDataTable=(hits)=>{
    console.log(hits)
    const columnTable = [];
    hits[0] &&
      Object.keys(hits[0]._source).map((value) => {
        const temp = {
          label: value,
          field: value,
          width: 100,
          attributes: {
            "aria-controls": "DataTable",
            "aria-label": value,
          },
        };
        columnTable.push(temp);
      });

    const rowTable = [];

    hits[0] &&
      hits.map((value) => {
        const obj = Object.entries(value._source);
        const idField = ["idField", value._id];
        obj.unshift(idField)
        const objtemp = Object.fromEntries(obj);
        rowTable.push(objtemp);
      });

    const dataTable = {
      columns: columnTable,
      rows: rowTable,
    };
    setDataTable(dataTable);
  }
  useEffect(() => {
    if (search === false) {
      getData();
    } else {
      SearchRecord();
    }
   getDataTable(); 
  }, [size]);
  const handleReloadRecord = () => {
    getData();
    getDataTable();
  }
  const handleOnChangeOption = (e) => {
    if (e.target.value) {
      setSearchBy(e.target.value);
    }
  };
  const handleRemoveRecord = (id) => {
    DeleteRecord(id);
  };
  const jsUcfirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const handleSearchRecord = (e) => {
    if (textSearchRecord === "") {
      e.preventDefault();
    } else {
      setSearch(true);
      SearchRecord();
    }
  };
  const handleNextPage = (e) => {
    if (scroll_id === "") {
      e.preventDefault();
    } else {
      async function nextPage() {
        let response = await axios.post(`/nextpage`, { scroll_id });
        console.log(response);
        if (response.status === 200) {
          setScrollId(response.data._scroll_id);
          setData(response.data.hits);
        }
      }
      nextPage();
    }
  };
  const handleDeleteRecord = (e) => {
    if (idDeleteRecord === "") {
      e.preventDefault();
    } else {
      DeleteRecord();
    }
  };
  return (
    <>
      <CDBBreadcrumb>
        <a className="breadcrumb-item" href="/">
          Home
        </a>
        <a className="breadcrumb-item" href="/indexs">
          Index List
        </a>
        <li className="breadcrumb-item active">Edit Index</li>
      </CDBBreadcrumb>
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexFlow: "column",
          height: "100vh",
          overflowY: "hidden",
        }}
      >
        <div style={{ height: "100%" }}>
          <div
            style={{
              padding: "20px 5%",
              height: "calc(100% - 64px)",
              overflowY: "scroll",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(1, minmax(200px, 1000px))",
                width: "1800px",
              }}
            >
              <div style={{ display: "auto" }}>
                <div className="mt-5 w-100">
                  <h4 className="font-weight-bold mb-3">Edit Field In Index</h4>
                </div>
                <div style={{ display: "flex", margin: "10px" }}>
                  <Form.Control
                    type="text"
                    value={textSearchRecord}
                    onChange={(e) => setTextSearchRecord(e.target.value)}
                    required
                    style={{ width: "20%", height: "40px" }}
                  />

                  <select
                    aria-label="Default select example"
                    style={{
                      height: "40px",
                      marginLeft: "10px",
                      width: "170px",
                    }}
                    onChange={handleOnChangeOption}
                  >
                    <option>Tìm theo</option>
                    {data.hits != undefined
                      ? Object.keys(data.hits[0]._source).map((key) => (
                        <option key={key} value={key}>
                          {jsUcfirst(key)}
                        </option>
                      ))
                      : null}
                  </select>

                  <Button className="button_index" onClick={handleSearchRecord}>
                    Tìm bản ghi
                  </Button>
                  <Button className="reload_button" onClick={handleReloadRecord}>
                    Reload
                  </Button>
                </div>
                <div style={{ display: "flex", margin: "10px" }}>
                  <>
                    <Form.Control
                      type="text"
                      value={idDeleteRecord}
                      onChange={(e) => setIdDeleteRecord(e.target.value)}
                      placeholder="ID bản ghi"
                      required
                      style={{ width: "50%" }}
                    />
                    <br />
                  </>
                  <Button className="button_index" onClick={handleDeleteRecord}>

                    Xoá bản ghi
                  </Button>
                </div>
              </div>
              {/* co length moi render */}
              <div
                className="container_headertable"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                {data.hits !== undefined ? (
                  <h4>Tổng cộng có {data.total.value} bản ghi</h4>
                ) : null}
                {/* <div
                  className="container_button_pagination"
                  style={{ height: "40px" }}
                >
                  <Button onClick={handleNextPage}>Next Page</Button>
                  <select
                    onChange={(e) => setSize(e.target.value)}
                    style={{ height: "35px", margin: "5px" }}
                  >
                    <option key={20} value={20}>
                      20
                    </option>
                    <option key={50} value={50}>
                      50
                    </option>
                    <option key={100} value={100}>
                      100
                    </option>
                  </select>
                </div> */}
              </div>

              {/* <CDBTable responsive className="table_render_data">
                <CDBTableHeader color="dark">
                  {data.hits !== undefined ? (
                    <tr>
                      {console.log(scroll_id)}
                      <th>Id</th>
                      {Object.keys(data.hits[0]._source).map((value) => (
                        <th>{jsUcfirst(value)}</th>
                      ))}
                      <th>Action</th>
                    </tr>

                  ) : null}
                </CDBTableHeader>
                <CDBTableBody>
                  {data.hits !== undefined ? (
                    data.hits.map((value) =>
                      <tr>
                        <td>{value._id}</td>
                        {Object.values(value._source).map(dat =>
                          <td>{dat}</td>
                        )}
                        <td>
                          <button className="btn btn-outline-primary" >Edit</button>
                          <button className="btn btn-outline-danger" style={{ margin: "4px" }} onClick={() => handleRemoveRecord(value._id)}>Remove</button>
                        </td>
                      </tr>
                    )
                  ) : null}
                </CDBTableBody>
              </CDBTable> */}
              <CDBCard>
                <CDBCardBody>
                  <CDBDataTable
                    striped
                    bordered
                    hover
                    responsive
                    checkbox
                    autoWidth={true}
                    entriesOptions={[10, 50, 100]}
                    entries={10}
                    pagesAmount={4}
                    data={dataTable}
                    materialSearch={true}
                  />
                </CDBCardBody>
              </CDBCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditIndexPage;