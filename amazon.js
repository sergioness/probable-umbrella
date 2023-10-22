const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

async function upload(file, filename) {
  const putObject = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    Body: JSON.stringify(file),
    ContentType: "application/json",
  });
  const { VersionId } = await s3.send(putObject);
  const getObject = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
  });
  const expiresIn = process.env.AWS_S3_SIGNED_URL_EXPIRES_IN;
  const url = await getSignedUrl(s3, getObject, { expiresIn });
  return { filename, url, version: VersionId };
}

async function download(filename) {
  const getObject = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    ResponseContentType: "application/json",
  });
  const { Body, VersionId } = await s3.send(getObject);
  const rawFile = await Body.transformToString();
  const file = JSON.parse(rawFile);
  return file;
}

async function hasLastUploadBeenValidSince(filename, sinceDate) {
  const headObject = new HeadObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
  });
  let isValid = false;
  try {
    const { LastModified } = await s3.send(headObject);
    const lastModifiedDate = new Date(LastModified);
    isValid = lastModifiedDate >= sinceDate;
  } catch (error) {
    console.warn("Could not retrieve the last upload of %s file", filename);
  }
  return isValid;
}

module.exports = {
  upload,
  download,
  hasLastUploadBeenValidSince,
};
