"use client";

import { useState, useEffect } from "react";

interface ServiceCategory {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  icon: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

interface Service {
  id: number;
  categoryId: number;
  name: string;
  nameEn: string;
  description: string;
  options: string;
  basePrice: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "services">(
    "services"
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // New service form
  const [newService, setNewService] = useState({
    categoryId: "",
    name: "",
    nameEn: "",
    description: "",
    basePrice: "",
    options: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setCategories(data.categories);
        setServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "نامشخص";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a2744]">مدیریت خدمات</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#d4a853] hover:bg-[#c99d48] text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <i className="fas fa-plus ml-2"></i>
          افزودن خدمت
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === "services"
              ? "bg-[#1a2744] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          خدمات ({services.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === "categories"
              ? "bg-[#1a2744] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          دسته‌بندی‌ها ({categories.length})
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === "services" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    نام خدمت
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    دسته‌بندی
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    قیمت پایه
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    وضعیت
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold">{service.name}</p>
                        <p className="text-xs text-gray-500">
                          {service.nameEn}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getCategoryName(service.categoryId)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {service.basePrice
                        ? new Intl.NumberFormat("fa-IR").format(
                            parseInt(service.basePrice)
                          ) + " تومان"
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {service.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setShowAddModal(true);
                        }}
                        className="text-blue-500 hover:underline text-sm ml-3"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#1a2744]">{category.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    category.type === "printing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {category.type === "printing" ? "چاپ" : "کافی‌نت"}
                </span>
              </div>
              <p className="text-sm text-gray-500">{category.description}</p>
              <p className="text-xs text-gray-400 mt-2">
                {services.filter((s) => s.categoryId === category.id).length}{" "}
                خدمت
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1a2744]">
                  {editingService ? "ویرایش خدمت" : "افزودن خدمت جدید"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                    setNewService({
                      categoryId: "",
                      name: "",
                      nameEn: "",
                      description: "",
                      basePrice: "",
                      options: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    دسته‌بندی
                  </label>
                  <select
                    value={newService.categoryId}
                    onChange={(e) =>
                      setNewService({ ...newService, categoryId: e.target.value })
                    }
                    className="select-field"
                  >
                    <option value="">انتخاب کنید</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام فارسی
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="نام خدمت"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام انگلیسی
                  </label>
                  <input
                    type="text"
                    value={newService.nameEn}
                    onChange={(e) =>
                      setNewService({ ...newService, nameEn: e.target.value })
                    }
                    className="input-field"
                    placeholder="service_name"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    توضیحات
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                    className="input-field h-20 resize-none"
                    placeholder="توضیحات خدمت..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    قیمت پایه (تومان)
                  </label>
                  <input
                    type="number"
                    value={newService.basePrice}
                    onChange={(e) =>
                      setNewService({ ...newService, basePrice: e.target.value })
                    }
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    گزینه‌ها (JSON)
                  </label>
                  <textarea
                    value={newService.options}
                    onChange={(e) =>
                      setNewService({ ...newService, options: e.target.value })
                    }
                    className="input-field h-24 resize-none font-mono text-sm"
                    placeholder='{"paperSize": ["A4", "A3"]}'
                    dir="ltr"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingService(null);
                    }}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    انصراف
                  </button>
                  <button className="flex-1 bg-[#d4a853] hover:bg-[#c99d48] text-white py-2 rounded-lg font-bold transition-colors">
                    <i className="fas fa-save ml-2"></i>
                    ذخیره
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
