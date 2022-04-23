const express = require("express");
const app = express();
const { indexToJsonView, CreateIndexJson } = require('./util/indexToJson')


var cors = require('cors')
require('dotenv').config()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require("axios");
const esUrl = `https://${process.env.USER_NAME}:${process.env.PASSWORD}@${process.env.ELASTIC_IP}:9200/`;
const shortid = require('shortid')
var multer = require('multer');
const path = require('path')
const util = require('util')
const fs = require('fs');
const client = require("./connect");




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), 'project/uploads'))
  },
  filename(req, file, cb) {
    cb(null, `${shortid.generate()}-${file.originalname}`)
  },
})

let files = ["./sample.json"]
const readFile = util.promisify(fs.readFile)

const upload = multer({ storage })
app.post("/create-index", async (req, res) => {
  console.log(req)
  try {
    const checkIndexExist = () =>
      new Promise((resolve) => {
        axios
          .get(`${esUrl}${req.body.index}`)
          .then((_) => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      });

    const ifIndexExist = await checkIndexExist();
    if (!ifIndexExist) {
      const esResponse = await axios.put(`${esUrl}${req.body.index}`, {
        mappings: {
          properties: {
            name: {
              type: "text",
            },
            email: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
            },
            country: {
              type: "text",
            },
            age: {
              type: "integer",
            },
            company: {
              type: "text",
            },
            jobRole: {
              type: "text",
            },
            description: {
              type: "text",
            },
            createdAt: {
              type: "date",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
            },
          },
        },
      });
      res.json(esResponse.data);
    } else {
      res.json("Index exist already");
    }
  } catch (error) {
    res.status(500).json(error);
  }
})
app.post("/data", upload.single('dataindex'), async (req, res) => {
  try {
    const { filename } = req.file
    console.log(req.file)
    const sampleData = require(`./uploads/${filename}`);

    let data = ""
    for (let idx = 0; idx < sampleData.length; idx++) {
      data = data + `{"index":{"_index":"${req.body.indexname}","_id" : "${idx + 1}"}}` + "\n"
      data = data + JSON.stringify(sampleData[idx]).replace("\n", "") + "\n"
    }
    const insert = await client.bulk({ body: data });
    res.json(insert)
    /*  res.json({"getalldata":`http://localhost:3000/data/${req.body.indexname}`,"delete":`http://localhost:3000/data/${req.body.indexname}/:id`,"query":`http://localhost:3000/data/${req.body.indexname}?type=matching&jobRole=Human&name=Kristy&country=Egypt`}); */

  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
});


app.post("/data/:index", async (req, res) => {
  try {
    let response;
    let match = {}
    let query = []
    let bool = {}
    const { type, id, operator } = req.body;
    delete match.type
    switch (type) {
      case "sorting":
        response = await axios.post(`${esUrl}${req.params.index}/_search`, {
          sort: {
            createdAt: "desc",
          },
        });
        break;

      case "matching":
        Object.keys(req.body).map((key, index) => {
          Object.assign(match, { match: { [key]: req.body[key] } },)
        })
        response = await axios.post(`${esUrl}${req.params.index}/_search`, {
          query: match
        });
        break;

      case "multi-matching":
        Object.keys(req.body).map((key, index) => {
          Object.assign(match, { match: { [key]: req.body[key] } })
          query.push({ match: { [key]: req.body[key] } })
        })
        query = query.slice(2)
        console.log(query)
        if (operator === "and") {
          Object.assign(bool, { must: query })
        }
        else {
          Object.assign(bool, { should: query })
        }
        response = await axios.post(`${esUrl}${req.params.index}/_search?size=1000`, {
          query: {
            bool: bool
          },
        });
        break;

      default:
        response = await axios.get(`${esUrl}${req.params.index}/_search?size=10000`);
        break;
    }

    res.json(response.data.hits.hits);
  } catch (error) {
    res.json(error);
  }
});
app.delete("/data/:index/:id", async (req, res) => {
  try {
    const response = await axios.delete(
      `${esUrl}${req.params.index}/_doc/${req.params.id}`
    );
    res.json(response.data);
  } catch (error) {
    res.json(error);
  }
});
app.delete("/:index", async (req, res) => {
  try {
    const response = await client.indices.delete({ index: req.params.index })
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});
app.get("/indexs", async (req, res) => {
  try {
    const response = await axios.get(
      // `${esUrl}_cat/indices?h=index`
      `${esUrl}_cat/indices?pretty`
    );
    // const allIndex = response.data.replace(/\n/g, ' ').split(" ");
    // const result = allIndex.filter(word => word.length > 0)
    const allIndex = response.data.replace(/\n/g, ' ').split(" ");
    const temp = allIndex.filter(word => word.length > 0)
    // const test = indexToJsonView(result)
    const result = CreateIndexJson(temp)
    res.json(result);
  } catch (error) {
    res.json(error);
  }
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
})