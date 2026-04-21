"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Download, Image as ImageIcon, Trash2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assetsApi, profileApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

type MediaItem = { name: string; path: string };
type StudioResult = {
  original_path: string;
  processed_path: string;
  preview_path: string;
  style: string;
  placement: {
    template: string;
    shape: string;
    align: string;
    size_hint: string;
    notes: string[];
  };
  recommendations: string[];
};
type DeleteTarget = MediaItem | null;

const toAssetUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/photos/") || path.startsWith("/templates/") || path.startsWith("/uploads/")) return path;
  return `/backend${path.startsWith("/") ? path : `/${path}`}`;
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];
const isAllowedAsset = (item: MediaItem, extensions: string[]) => {
  const name = (item.name || item.path || "").toLowerCase();
  return !name.startsWith(".") && extensions.some((extension) => name.endsWith(extension));
};

const PHOTO_PROMPTS = [
  {
    key: "corporate-headshot-dark-gray",
    name: "Corporate Headshot",
    description: "Dark gray studio, LinkedIn/business headshot, calm confident expression.",
    prompt:
      "Create a photorealistic professional corporate headshot of the same man from the reference image. Preserve his real facial structure, beard color and shape, hair color, skin tone, and overall likeness. He should be wearing a well-fitted black suit, white dress shirt, and black tie. Pose him in a clean studio setting with a neutral dark gray background. Use soft diffused studio lighting with gentle shadows, realistic skin texture, sharp focus on the face, and a polished but natural professional look. Frame the image as a chest-up portrait, with the subject slightly turned toward the camera, maintaining direct eye contact and a calm, confident expression. Make it look like a high-end LinkedIn profile photo or formal business headshot. No exaggerated facial features, no artificial skin smoothing, no cartoon effect, no distorted hands, no extra objects, no background clutter.",
  },
  {
    key: "formal-cv-portrait-soft-gray",
    name: "Formal CV Portrait",
    description: "Soft gray studio, centered upper-body CV portrait, slight professional smile.",
    prompt:
      "Create a photorealistic formal portrait of the same man from the reference image, preserving his real identity, facial proportions, beard, hairstyle, and natural appearance. He is standing straight in a classic professional pose, facing the camera directly with symmetrical posture. Dress him in a black suit, white shirt, and black tie. Use a neutral studio background in soft gray tones. The framing should show the upper body, including shoulders and upper chest, with a balanced centered composition. Use soft professional studio lighting, realistic skin details, sharp eyes, and a clean business-style finish suitable for CV, LinkedIn, or official profile use. Expression should be calm, natural, and confident, with a very slight professional smile. Avoid stylization, avoid beauty filter effects, avoid unnatural symmetry, avoid over-editing, avoid warped facial features, avoid dramatic fashion lighting.",
  },
  {
    key: "formal-id-style-gray",
    name: "Formal ID Style",
    description: "Light/medium gray background, official profile clarity, neutral expression.",
    prompt:
      "Generate a highly realistic formal ID-style portrait of the same man from the reference image. Preserve his real face, beard, hairline, and skin tone. He should be looking directly at the camera with a straight posture and neutral, professional expression. Dress him in formal business attire: black suit jacket, white dress shirt, black tie. Use a plain light gray or medium gray studio background, evenly lit with soft frontal lighting, minimal shadows, and high facial clarity. The composition should be centered and balanced, similar to a professional passport or official business portrait, while still looking premium and studio quality. Natural skin texture, realistic beard detail, sharp focus, no stylization, no glamour effect, no excessive retouching, no background elements.",
  },
  {
    key: "executive-navy-studio",
    name: "Executive Navy Studio",
    description: "Authoritative executive profile photo with navy suit and dark studio background.",
    prompt:
      "Create a new photorealistic high-resolution executive profile photo from the reference image. Preserve the person's exact face structure, identity, facial proportions, beard, hair, skin tone, and core features. Frame the subject from the chest upward with enough negative space above the head; do not crop the top of the head or hair. The subject looks directly into the camera with a confident, authoritative expression, with the body positioned in a subtle three-quarter angle. Dress the subject in a premium navy suit, white dress shirt, and simple tie. Use a plain neutral studio background in #141414. Use bright, airy, soft diffused studio lighting from a slightly high angle, gently lighting the face and creating subtle catchlights in the eyes, giving a sense of leadership and authority. Shoot with an 85mm f/1.8 portrait lens look, shallow depth of field, perfect focus on the eyes, and soft natural bokeh. Show crisp suit fabric texture, individual hair detail, and natural realistic skin texture. The mood should communicate confidence, professionalism, and executive presence. Use clean bright cinematic color grading with subtle warmth and balanced tones. No cropping, no distorted facial features, no artificial smoothing, no cartoon style, no extra objects, no background clutter.",
  },
  {
    key: "creative-black-turtleneck",
    name: "Creative Professional",
    description: "Warm creative portrait with black turtleneck and polished studio lighting.",
    prompt:
      "Create a new photorealistic high-resolution creative professional profile photo from the reference image. Preserve the person's exact face structure, identity, facial proportions, beard, hair, skin tone, and core features. Frame the subject from the chest upward with enough negative space above the head; do not crop the top of the head or hair. The subject looks directly into the camera with a warm, creative expression, with the body slightly angled and one shoulder subtly forward. Dress the subject in a well-fitted black turtleneck, styled for a professional studio portrait. Use a plain neutral studio background in #141414. Use bright, airy, soft diffused studio lighting from a slightly high angle, gently lighting the face and creating subtle catchlights in the eyes, giving a sense of artistic vision and innovation. Shoot with an 85mm f/1.8 portrait lens look, shallow depth of field, perfect focus on the eyes, and soft natural bokeh. Show crisp turtleneck fabric texture, individual hair detail, and natural realistic skin texture. The mood should communicate confidence, creativity, and artistic professionalism. Use clean bright cinematic color grading with subtle warmth and balanced tones. No cropping, no distorted facial features, no artificial smoothing, no cartoon style, no extra objects, no background clutter.",
  },
  {
    key: "tech-founder-henley",
    name: "Tech Founder",
    description: "Modern approachable founder portrait with rolled-sleeve henley.",
    prompt:
      "Create a new photorealistic high-resolution technology founder profile photo from the reference image. Preserve the person's exact face structure, identity, facial proportions, beard, hair, skin tone, and core features. Frame the subject from the chest upward with enough negative space above the head; do not crop the top of the head or hair. The subject looks directly into the camera with a relaxed, friendly expression, with the body positioned in a comfortable slight lean. Dress the subject in a modern henley shirt with rolled sleeves, styled for a contemporary professional studio portrait. Use a plain neutral studio background in #141414. Use bright, airy, soft diffused studio lighting from a slightly high angle, gently lighting the face and creating subtle catchlights in the eyes, giving a sense of innovation and approachability. Shoot with an 85mm f/1.8 portrait lens look, shallow depth of field, perfect focus on the eyes, and soft natural bokeh. Show crisp henley fabric texture, individual hair detail, and natural realistic skin texture. The mood should communicate confidence, innovation, and modern professionalism. Use clean bright cinematic color grading with subtle warmth and balanced tones. No cropping, no distorted facial features, no artificial smoothing, no cartoon style, no extra objects, no background clutter.",
  },
  {
    key: "healthcare-white-coat",
    name: "Healthcare Professional",
    description: "Trustworthy medical profile portrait with white coat and soft studio light.",
    prompt:
      "Create a new photorealistic high-resolution healthcare professional profile photo from the reference image. Preserve the person's exact face structure, identity, facial proportions, beard, hair, skin tone, and core features. Frame the subject from the chest upward with enough negative space above the head; do not crop the top of the head or hair. The subject looks directly into the camera with a trustworthy, compassionate expression, with the body facing the camera in excellent posture. Dress the subject in a white medical coat over a light blue collared shirt, styled for a professional studio portrait. Use a plain neutral studio background in #141414. Use bright, airy, soft diffused studio lighting from a slightly high angle, gently lighting the face and creating subtle catchlights in the eyes, giving a sense of expertise and care. Shoot with an 85mm f/1.8 portrait lens look, shallow depth of field, perfect focus on the eyes, and soft natural bokeh. Show crisp white coat fabric texture, individual hair detail, and natural realistic skin texture. The mood should communicate confidence, reliability, and medical professionalism. Use clean bright cinematic color grading with subtle warmth and balanced tones. No cropping, no distorted facial features, no artificial smoothing, no cartoon style, no extra objects, no background clutter.",
  },
  {
    key: "academic-tweed-consultant",
    name: "Academic Consultant",
    description: "Thoughtful academic profile with tweed jacket and cream sweater.",
    prompt:
      "Create a new photorealistic high-resolution academic consultant profile photo from the reference image. Preserve the person's exact face structure, identity, facial proportions, beard, hair, skin tone, and core features. Frame the subject from the chest upward with enough negative space above the head; do not crop the top of the head or hair. The subject looks directly into the camera with a thoughtful, intellectual expression, with the body positioned in a subtle contemplative angle. Dress the subject in a classic tweed sport coat over a cream-colored sweater, styled for a professional studio portrait. Use a plain neutral studio background in #141414. Use bright, airy, soft diffused studio lighting from a slightly high angle, gently lighting the face and creating subtle catchlights in the eyes, giving a sense of wisdom and expertise. Shoot with an 85mm f/1.8 portrait lens look, shallow depth of field, perfect focus on the eyes, and soft natural bokeh. Show crisp tweed fabric texture, individual hair detail, and natural realistic skin texture. The mood should communicate confidence, intellectual authority, and academic professionalism. Use clean bright cinematic color grading with subtle warmth and balanced tones. No cropping, no distorted facial features, no artificial smoothing, no cartoon style, no extra objects, no background clutter.",
  },
  {
    key: "sales-client-facing",
    name: "Client-Facing Sales",
    description: "Warm approachable business portrait for sales or customer-facing roles.",
    prompt:
      "Create a new photorealistic high-resolution client-facing sales professional profile photo from the reference image. Preserve the person's exact face structure, identity, facial proportions, beard, hair, skin tone, and core features. Frame the subject from the chest upward with enough negative space above the head; do not crop the top of the head or hair. The subject looks directly into the camera with a warm, welcoming smile, with the body positioned in an open and friendly posture. Dress the subject in a charcoal smart-casual cardigan over a white blouse or clean white professional top, styled for a professional studio portrait. Use a plain neutral studio background in #141414. Use bright, airy, soft diffused studio lighting from a slightly high angle, gently lighting the face and creating subtle catchlights in the eyes, giving a sense of warmth and trustworthiness. Shoot with an 85mm f/1.8 portrait lens look, shallow depth of field, perfect focus on the eyes, and soft natural bokeh. Show crisp cardigan fabric texture, individual hair detail, and natural realistic skin texture. The mood should communicate confidence, approachability, and professional warmth. Use clean bright cinematic color grading with subtle warmth and balanced tones. No cropping, no distorted facial features, no artificial smoothing, no cartoon style, no extra objects, no background clutter.",
  },
];

export default function AssetsPage() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { profileId } = useAuth();

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [generatedPhotos, setGeneratedPhotos] = useState<MediaItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [activeProfilePhoto, setActiveProfilePhoto] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(PHOTO_PROMPTS[0].key);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deletingPath, setDeletingPath] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [savingProfilePhoto, setSavingProfilePhoto] = useState("");
  const [studio, setStudio] = useState<StudioResult | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const [photoData, generatedData] = await Promise.all([
        assetsApi.listPhotos(),
        assetsApi.listGeneratedPhotos(),
      ]);
      const safePhotos = (photoData || []).filter((item: MediaItem) => isAllowedAsset(item, IMAGE_EXTENSIONS));
      const safeGenerated = (generatedData || []).filter((item: MediaItem) => isAllowedAsset(item, IMAGE_EXTENSIONS));
      setPhotos(safePhotos);
      setGeneratedPhotos(safeGenerated);
      if (!safePhotos.some((item: MediaItem) => item.path === selectedPhoto)) {
        setSelectedPhoto(safePhotos[0]?.path || "");
      }
      if (!profileId) {
        setActiveProfilePhoto("");
      } else {
        try {
          const profile = await profileApi.get(profileId);
          setActiveProfilePhoto(profile?.photo_url || "");
        } catch {
          setActiveProfilePhoto("");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Assets could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [profileId, selectedPhoto]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const selectedPhotoUrl = useMemo(() => toAssetUrl(selectedPhoto), [selectedPhoto]);
  const studioPreviewUrl = useMemo(() => toAssetUrl(studio?.preview_path || ""), [studio]);
  const studioProcessedUrl = useMemo(() => toAssetUrl(studio?.processed_path || ""), [studio]);

  const uploadPhoto = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const created = await assetsApi.uploadPhoto(form);
      setSelectedPhoto(created.path);
      toast.success("Photo uploaded.");
      await loadAssets();
    } catch (error) {
      console.error(error);
      toast.error("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const professionalize = async () => {
    if (!selectedPhoto) {
      toast.error("Select a photo first.");
      return;
    }
    setProcessing(true);
    try {
      const result = await assetsApi.professionalizePhoto({
        photo_path: selectedPhoto,
        style: PHOTO_PROMPTS.find((preset) => preset.key === selectedPrompt)?.prompt || PHOTO_PROMPTS[0].prompt,
      });
      setStudio(result);
      setActiveProfilePhoto(result.processed_path);
      if (profileId) {
        await assetsApi.usePhotoInProfile({
          profile_id: profileId,
          photo_path: result.processed_path,
        });
      }
      await loadAssets();
      toast.success(profileId ? "AI portrait generated and set for CV." : "AI portrait generated.");
    } catch (error) {
      console.error(error);
      toast.error("Photo could not be generated. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  const deletePhoto = async (photoPath: string) => {
    if (!photoPath) return;

    setDeletingPath(photoPath);
    try {
      await assetsApi.deletePhoto(photoPath);
      if (selectedPhoto === photoPath) setSelectedPhoto("");
      if (studio?.processed_path === photoPath || studio?.preview_path === photoPath) setStudio(null);
      if (activeProfilePhoto === photoPath) setActiveProfilePhoto("");
      setDeleteTarget(null);
      await loadAssets();
      toast.success("Photo deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Photo could not be deleted.");
    } finally {
      setDeletingPath("");
    }
  };

  const useInCv = async (photoPath: string) => {
    if (!profileId) {
      toast.error("Save your profile first, then choose the CV photo.");
      return;
    }

    setSavingProfilePhoto(photoPath);
    try {
      const selected = await assetsApi.usePhotoInProfile({
        profile_id: profileId,
        photo_path: photoPath,
      });
      setActiveProfilePhoto(selected.path);
      toast.success("This photo will be used in your CV.");
    } catch (error) {
      console.error(error);
      toast.error("CV photo could not be updated.");
    } finally {
      setSavingProfilePhoto("");
    }
  };

  return (
    <div className="space-y-8" data-testid="assets-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="label-mono mb-3">Studio assets</div>
          <h1 className="font-heading text-4xl font-medium">Assets</h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Upload a source photo, choose a Markdown prompt, and generate a brand-new AI portrait from that reference.
          </p>
        </div>
        <Badge variant="mono">{loading ? "syncing" : "ready"}</Badge>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-2xl">
            <div className="label-mono mb-3">Delete photo</div>
            <h2 className="font-heading text-2xl font-medium">Remove this asset?</h2>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              This will delete the file from the backend. If the photo is currently used in your CV profile, it will be removed there too.
            </p>
            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
              <div className="truncate text-sm font-medium">{deleteTarget.name}</div>
              <div className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">{deleteTarget.path}</div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={Boolean(deletingPath)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => void deletePhoto(deleteTarget.path)} disabled={deletingPath === deleteTarget.path}>
                <Trash2 className="h-4 w-4" />
                {deletingPath === deleteTarget.path ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="label-mono">Photos</div>
              <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Only user-uploaded source photos are shown here.</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4" /> Upload photo
            </Button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void uploadPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {photos.length ? (
              photos.map((item) => (
                <div
                  key={item.path}
                  onClick={() => setSelectedPhoto(item.path)}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                    selectedPhoto === item.path
                      ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{item.name}</div>
                      <div className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">{item.path}</div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-[hsl(var(--border))] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:border-red-400 hover:text-red-400"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      disabled={deletingPath === item.path}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))] md:col-span-2">
                No photos uploaded yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <div className="label-mono">Portrait prompt preset</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Choose the style prompt used by the AI photo generator.
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="grid gap-2">
              {PHOTO_PROMPTS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    setSelectedPrompt(preset.key);
                  }}
                  className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    selectedPrompt === preset.key
                      ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--background))]/40 hover:border-[hsl(var(--foreground))]/40"
                  }`}
                >
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/40 p-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Prompt text is private. Users can choose a preset, but the full generation prompt stays hidden and is sent securely to the AI photo generator.
          </div>

          <Button className="w-full" onClick={() => void professionalize()} disabled={processing || !selectedPhoto}>
            <Wand2 className="h-4 w-4" /> {processing ? "Generating..." : "AI Generate photo"}
          </Button>
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div>
          <div className="label-mono">Generated photos</div>
          <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            AI-generated portraits are saved here after generation.
          </div>
        </div>

        {generatedPhotos.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {generatedPhotos.map((item) => (
              <div
                key={item.path}
                className={`group overflow-hidden rounded-xl border bg-[hsl(var(--background))]/40 ${
                  activeProfilePhoto === item.path ? "border-emerald-400" : "border-[hsl(var(--border))]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toAssetUrl(item.path)}
                  alt={item.name}
                  className="h-48 w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="border-t border-[hsl(var(--border))] px-3 py-2">
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {activeProfilePhoto === item.path ? "Currently used in CV" : "Generated portrait"}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button
                      size="xs"
                      variant={activeProfilePhoto === item.path ? "secondary" : "outline"}
                      className="col-span-2"
                      onClick={() => void useInCv(item.path)}
                      disabled={savingProfilePhoto === item.path}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {activeProfilePhoto === item.path ? "CV photo" : "Use in CV"}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setDeleteTarget(item)}
                      disabled={deletingPath === item.path}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <a href={toAssetUrl(item.path)} download className="mt-2 block text-xs text-[hsl(var(--muted-foreground))] underline-offset-4 hover:underline">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
            No AI-generated photos yet. Generate a portrait and it will appear here.
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="label-mono mb-4">Selected source</div>
          {selectedPhotoUrl ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhotoUrl}
                alt="Selected source"
                className="h-[360px] w-full rounded-xl border border-[hsl(var(--border))] object-contain"
              />
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedPhoto}</div>
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
              Select a photo to preview it here.
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="label-mono">Studio result</div>
            {studioProcessedUrl ? (
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant={activeProfilePhoto === studio.processed_path ? "secondary" : "outline"}
                  onClick={() => void useInCv(studio.processed_path)}
                  disabled={savingProfilePhoto === studio.processed_path}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {activeProfilePhoto === studio.processed_path ? "CV photo" : "Use in CV"}
                </Button>
                <a href={studioProcessedUrl} download className="inline-flex">
                  <Button size="xs" variant="secondary">
                    <Download className="h-3 w-3" /> Download
                  </Button>
                </a>
              </div>
            ) : null}
          </div>

          {studio && studioPreviewUrl ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={studioPreviewUrl}
                alt="Studio preview"
                className="h-[360px] w-full rounded-xl border border-[hsl(var(--border))] object-contain"
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="mono">{studio.style.length > 48 ? "AI generated portrait" : studio.style}</Badge>
                <Badge variant="outline">{studio.placement.template}</Badge>
                <Badge variant="outline">{studio.placement.shape}</Badge>
                <Badge variant="outline">{studio.placement.align}</Badge>
              </div>
              <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                {studio.recommendations.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex gap-2">
                    <ImageIcon className="mt-0.5 h-4 w-4 flex-none" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
              Run AI photo generation to see the generated image and download it.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
