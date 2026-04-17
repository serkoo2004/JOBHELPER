'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { MediaItem } from '../lib/types';

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
      setStatus(error instanceof Error ? error.message : 'Asset listesi yuklenemedi.');
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
      setStatus(`${label} secin.`);
      return;
    }

    const formData = new FormData();
    formData.append(label === 'Fotograf' ? 'photo' : 'template', file);

    setStatus(`${label} yukleniyor...`);
    try {
      await apiFetch<MediaItem>(url, {
        method: 'POST',
        body: formData,
      });
      const assetState = await refreshAssets();
      setPhotos(assetState.photos);
      setTemplates(assetState.templates);
      setStatus(`${label} basariyla yuklendi.`);
      if (label === 'Fotograf') setPhotoFile(null);
      if (label === 'Sablon') setTemplateFile(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `${label} yuklenirken hata olustu.`);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6">
        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,33,0.95),rgba(9,13,24,0.98))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Photo Studio</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Fotograf yukle</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Profil fotografini ya da duzenlenecek gorseli buraya ekle. Liste otomatik guncellenir.</p>
          <input className="mt-6 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none" type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} />
          <button className="mt-4 w-full rounded-3xl bg-accent px-6 py-3 text-base font-semibold text-surface transition hover:bg-[#9ff3d2]" type="button" onClick={() => void uploadFile('/assets/photos/upload', photoFile, 'Fotograf')}>
            Fotograf Yukle
          </button>
        </div>

        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,33,0.95),rgba(9,13,24,0.98))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Template Vault</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Sablon yukle</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">PDF, DOCX, HTML veya gorsel sablonlarini yukleyip daha sonra secilebilir hale getirebilirsin.</p>
          <input className="mt-6 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none" type="file" accept=".pdf,.docx,.html,.png,.jpg,.jpeg" onChange={(event) => setTemplateFile(event.target.files?.[0] ?? null)} />
          <button className="mt-4 w-full rounded-3xl bg-accent px-6 py-3 text-base font-semibold text-surface transition hover:bg-[#9ff3d2]" type="button" onClick={() => void uploadFile('/assets/templates/upload', templateFile, 'Sablon')}>
            Sablon Yukle
          </button>
        </div>

        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6 text-sm leading-7 text-slate-300">
          {status || 'Varliklar burada yonetilir. Yukledigin her dosya panelde gorunur.'}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Photo Library</p>
              <h3 className="mt-3 text-2xl font-semibold">Yuklu fotograflar</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">{photos.length} item</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {photos.length === 0 ? (
              <div className="rounded-[1.7rem] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">Henuz fotograf yuklenmedi.</div>
            ) : (
              photos.map((item) => (
                <div key={item.path} className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4">
                  <Image src={item.path} alt={item.name} width={320} height={220} className="h-44 w-full rounded-[1.2rem] object-cover" />
                  <p className="mt-4 text-sm font-medium text-white">{item.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Template Library</p>
              <h3 className="mt-3 text-2xl font-semibold">Yuklu sablonlar</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">{templates.length} item</span>
          </div>
          <div className="mt-6 space-y-3">
            {templates.length === 0 ? (
              <div className="rounded-[1.7rem] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">Henuz sablon yuklenmedi.</div>
            ) : (
              templates.map((item) => (
                <a key={item.path} href={item.path} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition hover:bg-white/10">
                  <span>{item.name}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-accent/80">Open</span>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
