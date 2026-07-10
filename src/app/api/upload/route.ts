import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  UPLOAD_ALLOWED_CONTENT_TYPES,
  UPLOAD_BLOB_FOLDER,
  UPLOAD_MAX_SIZE_BYTES,
} from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        if (!session?.user?.email) {
          throw new Error("Não autorizado.");
        }

        if (!pathname.startsWith(`${UPLOAD_BLOB_FOLDER}/`)) {
          throw new Error("Destino de upload inválido.");
        }

        return {
          allowedContentTypes: [...UPLOAD_ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: UPLOAD_MAX_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload.";
    const status = message === "Não autorizado." ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
