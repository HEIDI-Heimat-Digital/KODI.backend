const ObsClient = require("./eSDK_Storage_OBS_V2.1.4_Node.js/lib/obs");

const imageDelete = async (keys) => {
    const server = process.env.BUCKET_HOST;

    /*
     * Initialize a obs client instance with your account for accessing OBS
     */
    const obs = new ObsClient({
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_KEY,
        server,
    });

    const bucketName = process.env.BUCKET_NAME;

    try {
        obs.deleteObjects(
            {
                Bucket: bucketName,
                Quiet: false,
                Objects: keys,
            },
            (err, result) => {
                if (!err && result.CommonMsg.Status < 300) {
                    return "Success";
                } else {
                    return "Failed";
                }
            }
        );
    } catch (e) {
        return e;
    }
};

module.exports = imageDelete;