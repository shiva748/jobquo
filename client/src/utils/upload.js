import newRequest from "./newRequest"; // Import your axios instance

const upload = async (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");

      try {
        // Send the Base64 string to your server
        const res = await newRequest.post("/gigs/upload", { image: base64String });

        // Extract the URL or file path from the server's response
        const { url } = res.data;
        resolve(url);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    };

    reader.onerror = (err) => {
      console.log(err);
      reject(err);
    };

    // Read the file as a Data URL (Base64 encoded string)
    reader.readAsDataURL(file);
  });
};

export default upload;
