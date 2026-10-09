import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const workspaceId = (formData.get("workspaceId") as string) || null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5 MB limit" },
        { status: 400 }
      )
    }

    // Validate image mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image (PNG, JPEG, WebP, GIF, SVG)" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = file.name.split(".").pop() || "png"
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const objectKey = `avatars/${Date.now()}-${sanitizedFilename}`

    let avatarUrl = ""

    // Check if Neon Object Storage AWS S3 environment variables are configured
    const s3Endpoint = process.env.AWS_ENDPOINT_URL_S3
    const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID
    const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const s3Region = process.env.AWS_REGION || "us-east-1"
    const bucketName = process.env.NEON_OBJECT_STORAGE_BUCKET || "avatars"

    if (s3Endpoint && s3AccessKeyId && s3SecretAccessKey) {
      try {
        // Neon Object Storage requires path-style addressing: forcePathStyle: true
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
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000, immutable",
          })
        )

        // For public_read buckets in Neon Object Storage, the URL is ${AWS_ENDPOINT_URL_S3}/<bucket>/<object-key>
        avatarUrl = `${s3Endpoint.replace(/\/$/, "")}/${bucketName}/${objectKey}`
      } catch (s3Error: any) {
        console.error("Neon Object Storage upload failed, falling back to data URL:", s3Error)
        // Fallback to Base64 data URL so upload never breaks for the user
        const base64 = buffer.toString("base64")
        avatarUrl = `data:${file.type};base64,${base64}`
      }
    } else {
      // In local dev without s3 credentials yet pulled via neon env pull, use base64 data URL
      const base64 = buffer.toString("base64")
      avatarUrl = `data:${file.type};base64,${base64}`
    }

    // Persist to Neon Postgres in workspaces table
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

    return NextResponse.json({
      success: true,
      avatarUrl,
      avatarKey: objectKey,
    })
  } catch (error: any) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to process avatar upload" },
      { status: 500 }
    )
  }
}
