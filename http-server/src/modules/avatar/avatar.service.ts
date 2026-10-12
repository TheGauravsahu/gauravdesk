import { sql } from "../../db/index.js"
import { config } from "../../config/env.js"
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"

export class AvatarService {
  async uploadAvatar({
    file,
    filename,
    mimetype,
    workspaceId,
  }: {
    file: Buffer
    filename: string
    mimetype: string
    workspaceId?: string
  }) {
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.length > MAX_SIZE) {
      throw new Error("File exceeds 5 MB limit")
    }
    if (!mimetype.startsWith("image/")) {
      throw new Error("File must be an image (PNG, JPEG, WebP, GIF, SVG)")
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const objectKey = `avatars/${Date.now()}-${sanitizedFilename}`
    let avatarUrl = ""

    const s3Endpoint = config.aws.endpointUrlS3
    const s3AccessKeyId = config.aws.accessKeyId
    const s3SecretAccessKey = config.aws.secretAccessKey
    const s3Region = config.aws.region
    const bucketName = config.aws.bucket

    if (s3Endpoint && s3AccessKeyId && s3SecretAccessKey) {
      try {
        const s3 = new S3Client({
          forcePathStyle: true,
          endpoint: s3Endpoint,
          region: s3Region,
          credentials: {
            accessKeyId: s3AccessKeyId,
            secretAccessKey: s3SecretAccessKey,
          },
        })

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: file,
            ContentType: mimetype,
            CacheControl: "public, max-age=31536000, immutable",
          })
        )

        avatarUrl = `${s3Endpoint.replace(/\/$/, "")}/${bucketName}/${objectKey}`
      } catch (s3Error) {
        console.error("Neon S3 upload failed, falling back to data URL:", s3Error)
        const base64 = file.toString("base64")
        avatarUrl = `data:${mimetype};base64,${base64}`
      }
    } else {
      const base64 = file.toString("base64")
      avatarUrl = `data:${mimetype};base64,${base64}`
    }

    const targetWorkspace = workspaceId
      ? await sql`SELECT id FROM workspaces WHERE id = ${workspaceId} LIMIT 1;`
      : await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`

    if (targetWorkspace.length > 0) {
      const activeId = targetWorkspace[0].id
      await sql`
        UPDATE workspaces
        SET 
          avatar_url = ${avatarUrl},
          avatar_key = ${objectKey},
          updated_at = NOW()
        WHERE id = ${activeId};
      `
    }

    return {
      avatarUrl,
      avatarKey: objectKey,
    }
  }

  async deleteAvatar(workspaceId?: string) {
    const rows = workspaceId
      ? await sql`
          SELECT id, avatar_url, avatar_key
          FROM workspaces
          WHERE id = ${workspaceId}::uuid
          LIMIT 1;
        `
      : await sql`
          SELECT id, avatar_url, avatar_key
          FROM workspaces
          ORDER BY created_at ASC
          LIMIT 1;
        `

    if (rows.length === 0) {
      throw new Error("No workspace found")
    }

    const workspace = rows[0]
    await sql`
      UPDATE workspaces
      SET avatar_url = NULL, avatar_key = NULL, updated_at = NOW()
      WHERE id = ${workspace.id};
    `

    let storageCleanupWarning: string | undefined
    const avatarKey = workspace.avatar_key
    const avatarUrl = workspace.avatar_url
    const s3Endpoint = config.aws.endpointUrlS3
    const s3AccessKeyId = config.aws.accessKeyId
    const s3SecretAccessKey = config.aws.secretAccessKey

    const isStoredObject =
      typeof avatarKey === "string" &&
      avatarKey.length > 0 &&
      typeof avatarUrl === "string" &&
      !avatarUrl.startsWith("data:")

    if (isStoredObject && s3Endpoint && s3AccessKeyId && s3SecretAccessKey) {
      try {
        const s3 = new S3Client({
          forcePathStyle: true,
          endpoint: s3Endpoint,
          region: config.aws.region,
          credentials: {
            accessKeyId: s3AccessKeyId,
            secretAccessKey: s3SecretAccessKey,
          },
        })
        await s3.send(
          new DeleteObjectCommand({
            Bucket: config.aws.bucket,
            Key: avatarKey,
          })
        )
      } catch {
        storageCleanupWarning = "Avatar was reset, but storage cleanup failed."
      }
    }

    return { success: true, storageCleanupWarning }
  }
}

export const avatarService = new AvatarService()
