const clientUrl = process.env.CLIENT_URL;
const localUrl = process.env.LOCAL_URL;

const corsOptions = {
  origin: [localUrl, clientUrl],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  maxAge: 3600,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
