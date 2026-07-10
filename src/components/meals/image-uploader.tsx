"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { deleteUploadedImageAction } from "@/actions/meal.actions";
import {
  UPLOAD_ALLOWED_CONTENT_TYPES,
  UPLOAD_BLOB_FOLDER,
  UPLOAD_MAX_IMAGES_PER_MEAL,
  UPLOAD_MAX_SIZE_BYTES,
  UPLOAD_MAX_SIZE_MB,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MealImageValue } from "@/validators/meal.schema";

interface UploaderItem {
  localId: string;
  status: "uploading" | "done" | "error";
  previewUrl?: string;
  file?: File;
  image?: MealImageValue;
}

interface ImageUploaderProps {
  value: MealImageValue[];
  onChange: (images: MealImageValue[]) => void;
  disabled?: boolean;
}

let nextLocalId = 0;
const createLocalId = () => `img-${++nextLocalId}`;

export function ImageUploader({ value, onChange, disabled = false }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploaderItem[]>(() =>
    value.map((image) => ({ localId: createLocalId(), status: "done", image })),
  );

  useEffect(() => {
    return () => {
      setItems((current) => {
        current.forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        return current;
      });
    };
  }, []);

  function syncFormValue(nextItems: UploaderItem[]) {
    queueMicrotask(() => {
      onChange(
        nextItems
          .filter((item) => item.status === "done" && item.image)
          .map((item) => item.image as MealImageValue),
      );
    });
  }

  async function uploadItem(item: UploaderItem) {
    if (!item.file) return;

    try {
      const blob = await upload(`${UPLOAD_BLOB_FOLDER}/${item.file.name}`, item.file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setItems((current) => {
        const next = current.map((entry) =>
          entry.localId === item.localId
            ? {
                ...entry,
                status: "done" as const,
                image: { url: blob.url, pathname: blob.pathname },
              }
            : entry,
        );
        syncFormValue(next);
        return next;
      });
    } catch (error) {
      console.error("[upload]", error);
      toast.error(`Falha ao enviar "${item.file.name}". Tente novamente.`);
      setItems((current) =>
        current.map((entry) =>
          entry.localId === item.localId ? { ...entry, status: "error" as const } : entry,
        ),
      );
    }
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const availableSlots = UPLOAD_MAX_IMAGES_PER_MEAL - items.length;

    if (files.length > availableSlots) {
      toast.error(`Máximo de ${UPLOAD_MAX_IMAGES_PER_MEAL} imagens por refeição.`);
      files.splice(availableSlots);
    }

    const validFiles = files.filter((file) => {
      if (!(UPLOAD_ALLOWED_CONTENT_TYPES as readonly string[]).includes(file.type)) {
        toast.error(`"${file.name}" não é uma imagem suportada (JPEG, PNG, WebP, AVIF ou GIF).`);
        return false;
      }
      if (file.size > UPLOAD_MAX_SIZE_BYTES) {
        toast.error(`"${file.name}" excede o limite de ${UPLOAD_MAX_SIZE_MB} MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newItems: UploaderItem[] = validFiles.map((file) => ({
      localId: createLocalId(),
      status: "uploading",
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setItems((current) => [...current, ...newItems]);
    newItems.forEach((item) => void uploadItem(item));
  }

  function handleRetry(item: UploaderItem) {
    setItems((current) =>
      current.map((entry) =>
        entry.localId === item.localId ? { ...entry, status: "uploading" as const } : entry,
      ),
    );
    void uploadItem(item);
  }

  function handleRemove(item: UploaderItem) {
    if (item.status === "done" && item.image && !item.image.id) {
      void deleteUploadedImageAction(item.image.url);
    }

    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);

    setItems((current) => {
      const next = current.filter((entry) => entry.localId !== item.localId);
      syncFormValue(next);
      return next;
    });
  }

  const isFull = items.length >= UPLOAD_MAX_IMAGES_PER_MEAL;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.localId}
            className={cn(
              "group relative aspect-square animate-scale-in overflow-hidden rounded-lg border bg-zinc-50 transition-shadow hover:shadow-md",
              item.status === "error" ? "border-red-300" : "border-zinc-200",
            )}
          >
            {item.image?.url ? (
              <Image
                src={item.image.url}
                alt="Foto da refeição"
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt="Pré-visualização"
                className="size-full object-cover"
              />
            ) : null}

            {item.status === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40">
                <Loader2 aria-label="Enviando…" className="size-6 animate-spin text-white" />
              </div>
            )}

            {item.status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-950/50 p-1 text-center">
                <span className="text-[11px] font-medium text-white">Falha no envio</span>
                <button
                  type="button"
                  onClick={() => handleRetry(item)}
                  className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-zinc-800 transition-colors hover:bg-white"
                >
                  <RotateCcw className="size-3" />
                  Tentar de novo
                </button>
              </div>
            )}

            {item.status !== "uploading" && !disabled && (
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label="Remover imagem"
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-zinc-950/60 text-white opacity-0 transition-all group-hover:opacity-100 hover:scale-110 hover:bg-red-600 focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {!isFull && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 transition-all duration-200",
              "hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-600",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <ImagePlus aria-hidden className="size-6 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-medium">Adicionar</span>
          </button>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Até {UPLOAD_MAX_IMAGES_PER_MEAL} imagens (JPEG, PNG, WebP, AVIF ou GIF), máx.{" "}
        {UPLOAD_MAX_SIZE_MB} MB cada.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ALLOWED_CONTENT_TYPES.join(",")}
        multiple
        hidden
        onChange={(event) => {
          handleFilesSelected(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
