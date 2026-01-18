import axios from "axios";

export const fetchUserSchemas = async (email) => {
  try {
    const response = await axios.get(`documents?email=${email}`);
    return response.data; // Returns fetched schemas
  } catch (error) {
    console.error("Error fetching user schemas:", error);
    return [];
  }
};

export const uploadPDF = async (schema, pngContent) => {
  try {
    const response = await axios.post("start", {
      "schema":schema,
      "png":pngContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};
