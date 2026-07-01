"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { PublishSiteButton } from "@/components/admin/publish-site-button";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  id: string;
  categoryId: string | null;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  rawPrice: number;
  price: string;
  stock: number;
  mpn: string;
  brand: string;
  rawStatus: string;
  status: string;
  sku: string;
  featuredImageUrl: string;
  seoTitle: string;
  seoDescription: string;
};

type ProductFormState = {
  id?: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  mpn: string;
  brand: string;
  status: "draft" | "active" | "out_of_stock" | "archived";
  featuredImageUrl: string;
  seoTitle: string;
  seoDescription: string;
};

const emptyForm: ProductFormState = {
  categoryId: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  stock: "",
  sku: "",
  mpn: "",
  brand: "",
  status: "draft",
  featuredImageUrl: "",
  seoTitle: "",
  seoDescription: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type ProductManagerProps = {
  initialProducts: ProductRow[];
  categories: CategoryOption[];
};

export function ProductManager({
  initialProducts,
  categories,
}: ProductManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<ProductFormState>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editingProductId);

  const productsById = useMemo(
    () => new Map(initialProducts.map((item) => [item.id, item])),
    [initialProducts]
  );

  function resetForm() {
    setFormState(emptyForm);
    setEditingProductId(null);
    setErrorMessage("");
  }

  function fillFormFromProduct(productId: string) {
    const product = productsById.get(productId);
    if (!product) {
      return;
    }

    setFormState({
      id: product.id,
      categoryId: product.categoryId ?? "",
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: String(product.rawPrice),
      stock: String(product.stock),
      sku: product.sku,
      mpn: product.mpn,
      brand: product.brand,
      status:
        product.rawStatus === "active" ||
        product.rawStatus === "archived" ||
        product.rawStatus === "out_of_stock"
          ? product.rawStatus
          : "draft",
      featuredImageUrl: product.featuredImageUrl,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    });
    setEditingProductId(product.id);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" && !editingProductId ? { slug: slugify(String(value)) } : {}),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    const payload = {
      ...formState,
      slug: formState.slug || slugify(formState.name),
      price: Number(formState.price || 0),
      stock: Number(formState.stock || 0),
    };

    const endpoint = editingProductId
      ? `/api/admin/products/${editingProductId}`
      : "/api/admin/products";
    const method = editingProductId ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan produk.");
      }

      setFeedback(
        editingProductId
          ? "Produk berhasil diperbarui."
          : "Produk baru berhasil ditambahkan."
      );
      resetForm();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menyimpan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(productId: string) {
    const shouldDelete = window.confirm(
      "Hapus produk ini dari database? Tindakan ini tidak bisa dibatalkan."
    );

    if (!shouldDelete) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus produk.");
      }

      if (editingProductId === productId) {
        resetForm();
      }
      setFeedback("Produk berhasil dihapus.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menghapus."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-red-300">
              CRUD Produk
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              Form ini menyimpan draft produk ke Supabase. Produk baru atau edit
              produk aktif baru tampil di website publik setelah Anda klik publish.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
          >
            {isEditing ? <X className="size-4" /> : <Plus className="size-4" />}
            {isEditing ? "Batal Edit" : "Reset Form"}
          </button>
        </div>

        <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm text-zinc-300">
            Nama Produk
            <input
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Masukkan nama produk"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Kategori
            <select
              value={formState.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-zinc-300">
            Slug URL
            <input
              value={formState.slug}
              onChange={(event) => updateField("slug", slugify(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="slug-produk"
            />
          </label>

          <label className="text-sm text-zinc-300">
            SKU
            <input
              value={formState.sku}
              onChange={(event) => updateField("sku", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="N388-XXX-001"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Harga
            <input
              type="number"
              value={formState.price}
              onChange={(event) => updateField("price", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="1250000"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Stok
            <input
              type="number"
              value={formState.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="10"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Brand
            <input
              value={formState.brand}
              onChange={(event) => updateField("brand", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Sony"
            />
          </label>

          <label className="text-sm text-zinc-300">
            MPN
            <input
              value={formState.mpn}
              onChange={(event) => updateField("mpn", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="CFI-XXXX"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Status
            <select
              value={formState.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as ProductFormState["status"]
                )
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="out_of_stock">Habis</option>
              <option value="archived">Arsip</option>
            </select>
          </label>

          <label className="text-sm text-zinc-300">
            Gambar Produk
            <input
              value={formState.featuredImageUrl}
              onChange={(event) =>
                updateField("featuredImageUrl", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="https://..."
            />
          </label>

          <label className="text-sm text-zinc-300 lg:col-span-2">
            Deskripsi Singkat
            <textarea
              value={formState.shortDescription}
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Deskripsi singkat produk"
            />
          </label>

          <label className="text-sm text-zinc-300 lg:col-span-2">
            Deskripsi Lengkap
            <textarea
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Deskripsi lengkap produk"
            />
          </label>

          <label className="text-sm text-zinc-300">
            SEO Title
            <input
              value={formState.seoTitle}
              onChange={(event) => updateField("seoTitle", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Judul SEO produk"
            />
          </label>

          <label className="text-sm text-zinc-300">
            SEO Description
            <input
              value={formState.seoDescription}
              onChange={(event) =>
                updateField("seoDescription", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Deskripsi SEO produk"
            />
          </label>

          {feedback ? (
            <div className="rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-100 lg:col-span-2">
              {feedback}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 lg:col-span-2">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Memproses
                </>
              ) : isEditing ? (
                <>
                  <Save className="size-4" />
                  Simpan Draft Perubahan
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Tambah Produk Draft
                </>
              )}
            </button>

            <PublishSiteButton />
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.04] text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nama Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {initialProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-4 font-medium text-white">{product.name}</td>
                  <td className="px-4 py-4 text-zinc-400">{product.category}</td>
                  <td className="px-4 py-4 text-zinc-400">{product.sku}</td>
                  <td className="px-4 py-4 text-zinc-300">{product.price}</td>
                  <td className="px-4 py-4 text-zinc-300">{product.stock}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fillFormFromProduct(product.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
