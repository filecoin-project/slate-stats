const express = require("express");
const Sequelize = require("sequelize");
const app = express();
const port = 8080;
const dotenv = require("dotenv").config();

app.use(express.json());

const POSTGRESHOST = process.env.POSTGRESHOST || undefined;
const POSTGRESDB = process.env.POSTGRESDB || undefined;
const POSTGRESUSERNAME = process.env.POSTGRESUSERNAME || undefined;
const POSTGRESPASSWORD = process.env.POSTGRESPASSWORD || undefined;

const sequelize = new Sequelize(
  POSTGRESDB,
  POSTGRESUSERNAME,
  POSTGRESPASSWORD,
  {
    host: POSTGRESHOST,
    dialect: "postgres",
    dialectOptions: {
      encrypt: true,
    },
  }
);
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
    ticket: {
      type: Sequelize.STRING,
    },
    election_proof: {
      type: Sequelize.STRING,
    },
  },
  {
    // options
  }
);

Block.sync({ force: false });
app.get("/", (req, res) => res.json({ message: "Slate Stats API" }));
app.get("/blocks", async (req, res) => {
  try {
    const block = await Block.findAll({
      attributes: [
        "cid",
        "parentweight",
        "height",
        "parentstateroot",
        "height",
        "miner",
        "timestamp",
        "ticket",
        "election_proof",
      ],
    });
    res.json({ block });
  } catch (error) {
    console.error(error);
  }
});

// MESSAGES
const Message = sequelize.define(
  "messages",
  {
    cid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    from: {
      type: Sequelize.STRING,
    },
    to: {
      type: Sequelize.STRING,
    },
    nonce: {
      type: Sequelize.STRING,
    },
    gasprice: {
      type: Sequelize.NUMBER,
    },
    gaslimit: {
      type: Sequelize.NUMBER,
    },
  },
  {
    // options
  }
);
app.get("/messages", async (req, res) => {
  // const blockId = req.params.cid;
  // console.log(blockId);
  try {
    const message = await Message.findAll({
      attributes: ["cid", "from", "to", "nonce", "gasprice", "gaslimit"],
      offset: 1000,
      limit: 1000,
    });

    res.json({ message });
  } catch (error) {
    console.error(error);
  }
});

// MINER POWER
const MinerPower = sequelize.define(
  "miner_power",
  {
    miner_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    state_root: {
      type: Sequelize.STRING,
    },
    raw_bytes_power: {
      type: Sequelize.NUMBER,
    },
    quality_adjusted_power: {
      type: Sequelize.NUMBER,
    },
  },
  {
    // options
  }
);
app.get("/minerpowers", async (req, res) => {
  // const blockId = req.params.cid;
  // console.log(blockId);
  try {
    const minerpowers = await MinerPower.findAll({
      attributes: [
        "miner_id",
        "state_root",
        "raw_bytes_power",
        "quality_adjusted_power",
      ],
    });
    res.json({ minerpowers });
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () =>
  console.log(`Slate stats api listening on port ${port}!`)
);

app.get("/averageBlockTime", async (req, res) => {
  // const blockId = req.params.cid;
  // console.log(blockId);
  try {
    const sum = await Block.sum("timestamp");
    console.log(sum);
    const total = await Block.count();
    console.log(total);

    const average = sum / total;
    res.json({ average });
  } catch (error) {
    console.error(error);
  }
});

// RECEIPTS
const Receipts = sequelize.define("receipts", {
  msg: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  state: {
    type: Sequelize.STRING,
  },
  idx: {
    type: Sequelize.NUMBER,
  },
  exit: {
    type: Sequelize.NUMBER,
  },
  gas_used: {
    type: Sequelize.STRING,
  },
});

app.get("/receipts", async (req, res) => {
  // const blockId = req.params.cid;
  // console.log(blockId);
  try {
    const receipts = await Receipts.findAll({
      attributes: ["msg", "state", "idx", "exit", "gas_used"],
    });
    res.json({ receipts });
  } catch (error) {
    console.error(error);
  }
});

// BLOCK MESSAGES

const BlockMessage = sequelize.define("block_message", {
  block: {
    type: Sequelize.STRING,
  },
  message: {
    type: Sequelize.STRING,
  },
});

app.get("/blockMessages", async (req, res) => {
  // const blockId = req.params.cid;
  // console.log(blockId);
  try {
    const blockMessages = await BlockMessage.findAll({
      attributes: ["block", "message"],
    });
    res.json({ blockMessages });
  } catch (error) {
    console.error(error);
  }
});

// BLOCK REWARDS

const BlockReward = sequelize.define("block_reward", {
  state_root: {
    type: Sequelize.STRING,
  },
  base_block_reward: {
    type: Sequelize.NUMBER,
  },
});

app.get("/blockRewards", async (req, res) => {
  try {
    const blockRewards = await BlockReward.findAll({
      attributes: ["state_root", "base_block_reward"],
    });
    res.json({ blockRewards });
  } catch (error) {
    console.error(error);
  }
});

// BLOCK PARENTS

const BlockParent = sequelize.define("block_parent", {
  block: {
    type: Sequelize.STRING,
  },
  parent: {
    type: Sequelize.STRING,
  },
});

app.get("/blockParents", async (req, res) => {
  try {
    const blockParents = await BlockParent.findAll({
      attributes: ["block", "parent"],
    });
    res.json({ blockParents });
  } catch (error) {
    console.error(error);
  }
});
