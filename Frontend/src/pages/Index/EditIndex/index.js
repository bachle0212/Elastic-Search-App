import React, { useEffect, useState } from "react";
import axios from "../../../helper/axios";
import { Button, Card, NavItem } from "react-bootstrap";
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
import AlertCT from "../../../components/AlertCT";

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
  const [inputSearchAvanced, setInputSearchAvanced] = useState("");
  const [idDeleteRecord, setIdDeleteRecord] = useState("");
  const [searchby, setSearchBy] = useState("");
  const [hidden, setHidden] = useState(false);
  const [searchField, setSearchField] = useState([]);
  async function getData() {
    let response = await axios.getData(`/api/datas/${indexId}`);
    setData(response.data.hits);
    setScrollId(response.data._scroll_id);
    console.log(response);
  }
  async function SearchRecord() {
    let response;
    if (searchby !== "") {
      response = await axios.post(`/api/searchs/${indexId}`, {
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
        handleDataTable(response.data.hits.hits);
      }
    } else {
      response = await axios.post(`/api/searchs/${indexId}`, {
        input: textSearchRecord,
      });
      console.log(response);
      if (response.status === 200) {
        setData(response.data.hits);
        /* getDataTable(response.data.hits); */
        setScrollId(response.data._scroll_id);
        handleDataTable(response.data.hits.hits);
      }
    }
  }
  async function SearchAvancedRecord() {
    const response = await axios.post(`/api/searchadvanced/${indexId}`, {
      query: inputSearchAvanced,
    });
    if (response.status === 200) {
      setData(response.data.hits);
      /* getDataTable(response.data.hits); */
      setScrollId(response.data._scroll_id);
      handleDataTable(response.data.hits.hits);
    }
  }

  async function getDataTable() {
    let response = await axios.get(`/api/datas/${indexId}`);
    const data = response.data.hits;
    setData(data);
    handleDataTable(data.hits);
  }
  const handleDataTable = (hits) => {
    const columnTable = [
      {
        label: "Id",
        field: "idField",

        attributes: {
          "aria-controls": "DataTable",
          "aria-label": "idField",
        },
      },
    ];
    hits[0] &&
      Object.keys(hits[0]._source).map((value) => {
        const temp = {
          label: value,
          field: value,
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
        obj.unshift(idField);
        const objtemp = Object.fromEntries(obj);
        rowTable.push(objtemp);
      });

    const dataTable = {
      columns: columnTable,
      rows: rowTable,
    };
    setDataTable(dataTable);
  };
  useEffect(() => {
    if (search === false) {
      getData();
    } else {
      SearchRecord();
    }
    getDataTable();
  }, []);
  const handleReloadRecord = () => {
    getData();
    getDataTable();
  };
  const handleOnChangeOption = (e) => {
    if (e.target.value) {
      setSearchBy(e.target.value);
    }
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

  const handleSearchAvanced = (e) => {
    if (inputSearchAvanced === "") {
      e.preventDefault();
    } else {
      SearchAvancedRecord();
    }
  };

  const handleRemoveSearchField = (index) => {
    const list = [...searchField];
    list.splice(index, 1);
    setSearchField(list);
  };

  return (
    <>
      {/* <CDBBreadcrumb>
        <a className="breadcrumb-item" href="/">
          Trang ch???
        </a>
        <a className="breadcrumb-item" href="/indexs">
          Danh s??ch index
        </a>
        <li className="breadcrumb-item active">Ch???nh s???a index</li>
      </CDBBreadcrumb> */}

      <div className="container">
        <div className="search">
          <div className="mt-5 w-100">
            <h2 className="font-weight-bold mb-3" style={{ margin: "0 5px" }}>
              T??m ki???m
            </h2>
          </div>
          <div>
            <div style={{ display: "flex", margin: "10px" }}>
              <Form.Control
                type="text"
                value={textSearchRecord}
                placeholder="T??m ki???m c?? b???n"
                onChange={(e) => setTextSearchRecord(e.target.value)}
                required
                style={{ width: "20%", height: "40px" }}
              />
              <Button className="button_index" onClick={handleSearchRecord}>
                T??m b???n ghi
              </Button>

              <Button
                className="reload_button"
                onClick={handleReloadRecord}
                style={{ margin: "0 4px" }}
              >
                T???i l???i trang
              </Button>
            </div>

            {/* X??? l?? search c?? b???n */}
            {searchField !== null
              ? searchField.map((value) => (
                  <div style={{ display: "flex", margin: "10px" }}>
                    <Form.Control
                      type="text"
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
                      <option>T??m theo</option>
                      {data.hits != undefined
                        ? Object.keys(data.hits[0]._source).map((key) => (
                            <option key={key} value={key}>
                              {jsUcfirst(key)}
                            </option>
                          ))
                        : null}
                    </select>
                    <Button
                      style={{ margin: "0 10px" }}
                      onClick={() => handleRemoveSearchField(value)}
                    >
                      -
                    </Button>
                  </div>
                ))
              : null}
          </div>

          <div style={{ display: "flex", margin: "10px" }}>
            <>
              <Form.Control
                type="text"
                value={inputSearchAvanced}
                onChange={(e) => setInputSearchAvanced(e.target.value)}
                placeholder="T??m ki???m n??ng cao"
                required
                style={{ width: "50%" }}
              />
              <br />
            </>
            <Button className="button_index" onClick={handleSearchAvanced}>
              T??m ki???m b???n ghi
            </Button>
          </div>
          <h5 style={{ margin: "10px 10px", fontWeight: "bold" }}>
            Quy ?????c t??m ki???m n??ng cao &emsp; + : and &emsp; || &emsp; | : or
          </h5>
        </div>

        {/* co length moi render */}
        <div
          className="container_headertable"
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "40px 20px",
          }}
        >
          {data.hits !== undefined ? (
            <h3>T???ng c???ng c?? {data.total.value} b???n ghi</h3>
          ) : null}
        </div>

        <CDBCardBody response>
          <CDBDataTable
            striped
            bordered
            hover
            responsiveXL
            checkbox
            entriesOptions={[10, 50, 100]}
            entries={10}
            data={dataTable}
            searching={false}
          />
        </CDBCardBody>
      </div>
    </>
  );
};

export default EditIndexPage;
