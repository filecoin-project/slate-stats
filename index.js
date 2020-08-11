const express = require("express");
const Sequelize = require("sequelize");
const app = express();
const port = 3000;
const dotenv = require("dotenv").config();

app.use(express.json());

//note: colin -- postgresdb string should be formatted as POSTGRESDB=postgres://127.0.0.1/postgres
const POSTGRESDB = process.env.POSTGRESDB || undefined;
const sequelize = new Sequelize(POSTGRESDB);
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
const Block = sequelize.define(
  "blocks",
  {
    cid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    parentstateroot: {
      type: Sequelize.STRING,
    },
    parentweight: {
      type: Sequelize.NUMBER,
    },
    height: {
      type: Sequelize.NUMBER,
    },
    miner: {
      type: Sequelize.STRING,
    },
    timestamp: {
      type: Sequelize.NUMBER,
    },
  },
  {
    // options
  }
);
// Note: using `force: true` will drop the table if it already exists
Block.sync({ force: false });
app.get("/", (req, res) => res.json({ message: "Slate Stats API" }));
app.get("/block/:cid", async (req, res) => {
  const blockId = req.params.cid;
  console.log(blockId);
  try {
    const block = await Block.findAll({
      where: {
        cid: blockId,
      },
      attributes: [
        "cid",
        "parentweight",
        "height",
        "parentstateroot",
        "height",
        "miner",
        "timestamp",
      ],
    });
    res.json({ block });
  } catch (error) {
    console.error(error);
  }
});
app.listen(port, () =>
  console.log(`Slate stats api listening on port ${port}!`)
);
