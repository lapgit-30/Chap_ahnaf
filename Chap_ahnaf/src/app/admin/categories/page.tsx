"use client";

import { useEffect, useState } from "react";

type Category = { id: number; name: string; nameEn: string; type: "printing" | "cafe"; icon: string | null; description: string | null; isActive: boolean; sortOrder: number | null };
const empty = { name: "", nameEn: "", type: "printing" as "printing" | "cafe", icon: "cog", description: "", isActive: true, sortOrder: "0" };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("/api/admin/services", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (response.ok) setItems(data.categories);
    else setError(data.error);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const reset = () => { setForm(empty); setEditingId(null); setError(""); };
  const edit = (item: Category) => {
    setEditingId(item.id);
    setForm({ name: item.name, nameEn: item.nameEn, type: item.type, icon: item.icon || "cog", description: item.description || "", isActive: item.isActive, sortOrder: String(item.sortOrder || 0) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId, sortOrder: Number(form.sortOrder) }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      reset(); await load();
    } catch { setError("ارتباط با سرور برقرار نشد"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d4a853] border-t-transparent" /></div>;
  return <div className="space-y-6">
    <div><h1 className="text-xl font-bold text-[#1a2744]">مدیریت دسته‌بندی‌ها</h1><p className="mt-1 text-sm text-gray-500">ساختار نمایش خدمات چاپ و کافی‌نت</p></div>
    <form onSubmit={save} className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-[#1a2744]">{editingId ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</h2>{editingId && <button type="button" onClick={reset} className="text-sm text-gray-500">انصراف</button>}</div>
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div><label className="mb-2 block text-sm font-bold">نام فارسی</label><input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
        <div><label className="mb-2 block text-sm font-bold">نام انگلیسی</label><input required pattern="[a-z0-9_]+" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" dir="ltr" /></div>
        <div><label className="mb-2 block text-sm font-bold">نوع</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "printing" | "cafe" })} className="select-field"><option value="printing">خدمات چاپ</option><option value="cafe">خدمات کافی‌نت</option></select></div>
        <div><label className="mb-2 block text-sm font-bold">آیکن FontAwesome</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" dir="ltr" /></div>
        <div><label className="mb-2 block text-sm font-bold">ترتیب نمایش</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="input-field" /></div>
        <label className="flex items-end gap-2 pb-3 text-sm font-bold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-[#d4a853]" />فعال و قابل نمایش</label>
      </div>
      <div className="mt-4"><label className="mb-2 block text-sm font-bold">توضیحات</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" /></div>
      <button disabled={saving} className="mt-4 rounded-lg bg-[#d4a853] px-6 py-3 font-bold text-white disabled:opacity-60"><i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-save"} ml-2`} />{saving ? "در حال ذخیره" : "ذخیره دسته‌بندی"}</button>
    </form>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <button key={item.id} onClick={() => edit(item)} className="rounded-xl bg-white p-5 text-right shadow-lg transition hover:-translate-y-1">
      <div className="mb-3 flex items-center justify-between"><span className="font-bold text-[#1a2744]">{item.name}</span><span className={`rounded-full px-2 py-1 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "غیرفعال"}</span></div>
      <p className="text-sm text-gray-500">{item.description || "بدون توضیح"}</p><div className="mt-4 flex justify-between text-xs text-gray-400"><span>{item.type === "printing" ? "چاپ" : "کافی‌نت"}</span><span>ویرایش <i className="fas fa-edit mr-1" /></span></div>
    </button>)}</div>
  </div>;
}
