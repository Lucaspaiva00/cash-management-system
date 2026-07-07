const API_DEV = "http://localhost:3000";
const API_PROD = "https://cash-management-system.onrender.com";

const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API_BASE = isDev ? API_DEV : API_PROD;
