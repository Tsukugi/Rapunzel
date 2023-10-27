const getFileName = (imageUrl: string) => {
    // Extract the required parts from the URL
    const parts = imageUrl.split("/");
    const galleryId = parts[parts.length - 2]; // Extract "1234567"
    const fileName = parts[parts.length - 1]; // Extract "1.jpg"

    // Combine the extracted parts to form the desired string
    const result = `${galleryId}.${fileName}`;

    return result; // Output: "1234567.1.jpg"
};

// Format wada.wdaw.dwad.3.jpg
const getPageFromPath = (filename: string) => {
    // Extract the required parts from the URL
    const parts = filename.split(".");
    const page = parts[parts.length - 2]; // Extract "3"
    return page; // Output: "3"
};

const getIndexFromPath = (fileName: string) => {
    return +getPageFromPath(fileName) - 1;
};

const removeFileExtension = (path: string) => {
    const fileNameWithoutExtension = path.replace(/\.[^/.]+$/, ""); // Remove everything after the last dot
    return fileNameWithoutExtension;
};

export const NHentaiCache = {
    getFileName,
    getPageFromPath,
    getIndexFromPath,
    removeFileExtension,
};
