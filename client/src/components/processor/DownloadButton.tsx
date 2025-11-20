import React from "react";

const DownloadButton = (jsonData) => {
  const downloadJSON = (jsonData, filename = "data.json") => {
  // Convert object to JSON string
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Create a Blob with JSON MIME type
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a temporary link to download the blob
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append to body, trigger click, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => downloadJSON(jsonData, "myData.json")}
    >
      Download JSON
    </button>
  );
};

export default DownloadButton;