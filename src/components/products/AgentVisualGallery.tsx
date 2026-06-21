"use client";

import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TradingAgentProduct } from "@/types";

export default function AgentVisualGallery({
  product,
}: {
  product: TradingAgentProduct;
}) {
  const galleryImages = product.galleryImages;
  const galleryImageAlt = product.galleryImageAlt;
  const imageCount = galleryImages?.length ?? 0;
  const [galleryUnavailable, setGalleryUnavailable] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openImageIndex, setOpenImageIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (openImageIndex === null) {
        return;
      }

      if (event.key === "Escape") {
        setOpenImageIndex(null);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setZoom(1);
        const nextIndex = (openImageIndex + imageCount - 1) % imageCount;
        setActiveImageIndex(nextIndex);
        setOpenImageIndex(nextIndex);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setZoom(1);
        const nextIndex = (openImageIndex + 1) % imageCount;
        setActiveImageIndex(nextIndex);
        setOpenImageIndex(nextIndex);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageCount, openImageIndex]);

  useEffect(() => {
    if (openImageIndex === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [openImageIndex]);

  function openImage(index: number) {
    setZoom(1);
    setActiveImageIndex(index);
    setOpenImageIndex(index);
  }

  function closeImage() {
    setOpenImageIndex(null);
  }

  function showPreviousImage() {
    setZoom(1);
    if (openImageIndex === null) {
      return;
    }

    const nextIndex = (openImageIndex + imageCount - 1) % imageCount;
    setActiveImageIndex(nextIndex);
    setOpenImageIndex(nextIndex);
  }

  function showNextImage() {
    setZoom(1);
    if (openImageIndex === null) {
      return;
    }

    const nextIndex = (openImageIndex + 1) % imageCount;
    setActiveImageIndex(nextIndex);
    setOpenImageIndex(nextIndex);
  }

  if (!galleryImages?.length || galleryUnavailable) {
    return (
      <section className="agent-visual-gallery agent-visual-gallery-fallback" aria-label={`${product.name} product visual`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={`${product.name} product visual`} />
      </section>
    );
  }

  return (
    <>
      <section className="agent-visual-gallery" aria-label={`${product.name} image gallery`}>
        <div className="agent-gallery-heading">
          <span>Evidence gallery</span>
          <span>{activeImageIndex + 1} of {imageCount}</span>
        </div>
        <figure className="agent-gallery-primary">
          <button
            type="button"
            className="agent-gallery-trigger"
            onClick={() => openImage(activeImageIndex)}
            aria-label={`Open ${galleryImageAlt?.[activeImageIndex] ?? `${product.name} product image ${activeImageIndex + 1}`} at full size`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[activeImageIndex]}
              alt={galleryImageAlt?.[activeImageIndex] ?? `${product.name} product image ${activeImageIndex + 1}`}
              onError={() => setGalleryUnavailable(true)}
            />
            <span className="agent-gallery-expand" aria-hidden="true">
              <Maximize2 size={16} strokeWidth={1.8} />
            </span>
          </button>
        </figure>
        {imageCount > 1 ? (
          <div className="agent-gallery-thumbnails" aria-label={`${product.name} image selection`}>
            {galleryImages.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`agent-gallery-thumbnail${activeImageIndex === index ? " agent-gallery-thumbnail-active" : ""}`}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Show ${galleryImageAlt?.[index] ?? `${product.name} product image ${index + 1}`}`}
                aria-pressed={activeImageIndex === index}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  onError={() => setGalleryUnavailable(true)}
                />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {openImageIndex !== null ? (
        <div
          className="agent-image-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={galleryImageAlt?.[openImageIndex] ?? `${product.name} image viewer`}
          onClick={closeImage}
        >
          <div className="agent-image-dialog-panel" onClick={(event) => event.stopPropagation()}>
            <div className="agent-image-dialog-toolbar">
              <div className="agent-image-dialog-actions">
                <button
                  type="button"
                  className="agent-image-dialog-button"
                  onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <Minus size={18} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="agent-image-dialog-button"
                  onClick={() => setZoom((value) => Math.min(3, value + 0.5))}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <Plus size={18} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="agent-image-dialog-button"
                  onClick={() => setZoom(1)}
                  aria-label="Fit image to viewer"
                  title="Fit image to viewer"
                >
                  <RotateCcw size={17} strokeWidth={1.8} />
                </button>
                <div className="agent-image-dialog-zoom">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    aria-label="Custom image zoom"
                  />
                  <output aria-live="polite">{Math.round(zoom * 100)}%</output>
                </div>
              </div>
              <span className="agent-image-dialog-counter" aria-live="polite">
                {openImageIndex + 1} / {imageCount}
              </span>
              <button
                type="button"
                className="agent-image-dialog-button"
                onClick={closeImage}
                aria-label="Close image viewer"
                title="Close"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>
            {imageCount > 1 ? (
              <>
                <button
                  type="button"
                  className="agent-image-dialog-nav agent-image-dialog-nav-previous"
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeft size={24} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="agent-image-dialog-nav agent-image-dialog-nav-next"
                  onClick={showNextImage}
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRight size={24} strokeWidth={1.8} />
                </button>
              </>
            ) : null}
            <div className="agent-image-dialog-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImages[openImageIndex]}
                alt={galleryImageAlt?.[openImageIndex] ?? `${product.name} product image ${openImageIndex + 1}`}
                style={{ width: `${zoom * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
