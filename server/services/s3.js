import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (fileBuffer, fileName, mimetype) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `resumes/${Date.now()}-${fileName}`,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  // Generate signed URL (valid for 1 hour by default)
  const getObjectParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: params.Key,
  };
  const getCommand = new GetObjectCommand(getObjectParams);
  const signedUrl = await getSignedUrl(s3Client, getCommand, {
    expiresIn: 3600,
  });

  return signedUrl;
};

export const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  // Extract key from signed URL
  let key;
  try {
    const url = new URL(fileUrl);
    key = url.pathname.startsWith("/")
      ? url.pathname.substring(1)
      : url.pathname;
  } catch (e) {
    // Fallback for older URLs
    key = fileUrl.split(".amazonaws.com/")[1];
  }

  if (!key) return;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
};
