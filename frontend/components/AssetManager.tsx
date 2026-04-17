'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { MediaItem } from '../lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SurfaceCard from './ui/SurfaceCard';

const fieldClass =
  'mt-6 w-full rounded-[1.2rem] border border-[var(--border-medium)] bg-[color:var(--bg-primary)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition focus:border-[var(--border-accent)]';

export default function AssetManager() {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [templates, setTemplates] = useState<MediaItem[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const refreshAssets = async () => {
    try {
      const [photoData, templateData] = await Promise.all([
        apiFetch<MediaItem[]>('/assets/photos'),
        apiFetch<MediaItem[]>('/assets/templates'),
      ]);
      return {
        photos: photoData || [],
        templates: templateData || [],
      };
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Asset listesi yüklenemedi.');
      return {
        photos: [],
        templates: [],
      };
    }
  };

  useEffect(() => {
    let active = true;

    const loadAssets = async () => {
      const assetState = await refreshAssets();
      if (active) {
        setPhotos(assetState.photos);
        setTemplates(assetState.templates);
      }
    };

    void loadAssets();

    return () => {
      active = false;
    };
  }, []);

  const uploadFile = async (url: string, file: File | null, label: string) => {
    if (!file) {
      setStatus(`${label} seçin.`);
      return;
    }

    const formData = new FormData();
    formData.append(label === 'Fotoğraf' ? 'photo' : 'template', file);

    setStatus(`${label} yükleniyor...`);
    try {
      await apiFetch<MediaItem>(url, {
        method: 'POST',
        body: formData,
      });
      const assetState = await refreshAssets();
      setPhotos(assetState.photos);
      setTemplates(assetState.templates);
      setStatus(`${label} başarıyla yüklendi.`);
      if (label === 'Fotoğraf') setPhotoFile(null);
      if (label === 'Şablon') setTemplateFile(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `${label} yüklenirken hata oluştu.`);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6">
        <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute inset-0 grid-overlay opacity-20" />
          <div className="relative">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Photo Studio
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">Fotoğraf yükle</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              Profil fotoğrafını ya da düzenlenecek görseli buraya ekle. Liste otomatik güncellenir.
            </p>
            <input className={fieldClass} type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} />
            <Button className="mt-4 w-full" size="lg" type="button" onClick={() => void uploadFile('/assets/photos/upload', photoFile, 'Fotoğraf')}>
              Fotoğraf Yükle
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute inset-0 grid-overlay opacity-20" />
          <div className="relative">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Template Vault
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">Şablon yükle</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              PDF, DOCX, HTML veya görsel şablonlarını yükleyip daha sonra seçilebilir hale getirebilirsin.
            </p>
            <input className={fieldClass} type="file" accept=".pdf,.docx,.html,.png,.jpg,.jpeg" onChange={(event) => setTemplateFile(event.target.files?.[0] ?? null)} />
            <Button className="mt-4 w-full" size="lg" type="button" onClick={() => void uploadFile('/assets/templates/upload', templateFile, 'Şablon')}>
              Şablon Yükle
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[2rem] p-6 text-sm leading-7 text-[color:var(--text-secondary)]">
          {status || 'Varlıklar burada yönetilir. Yüklediğin her dosya panelde görünür.'}
        </SurfaceCard>
      </div>

      <div className="space-y-6">
        <SurfaceCard className="rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Photo Library
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[color:var(--text-primary)]">Yüklü fotoğraflar</h3>
            </div>
            <Badge tone="accent">{photos.length} item</Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {photos.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5 text-sm text-[color:var(--text-secondary)]">
                Henüz fotoğraf yüklenmedi.
              </div>
            ) : (
              photos.map((item) => (
                <div key={item.path} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4">
                  <Image src={item.path} alt={item.name} width={320} height={220} className="h-44 w-full rounded-[1.2rem] object-cover" />
                  <p className="mt-4 text-sm font-medium text-[color:var(--text-primary)]">{item.name}</p>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Template Library
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[color:var(--text-primary)]">Yüklü şablonlar</h3>
            </div>
            <Badge tone="accent">{templates.length} item</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {templates.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5 text-sm text-[color:var(--text-secondary)]">
                Henüz şablon yüklenmedi.
              </div>
            ) : (
              templates.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] px-4 py-4 text-sm text-[color:var(--text-primary)] transition hover:border-[var(--border-accent)] hover:bg-[color:var(--bg-hover)]"
                >
                  <span>{item.name}</span>
                  <Badge tone="accent">Open</Badge>
                </a>
              ))
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
