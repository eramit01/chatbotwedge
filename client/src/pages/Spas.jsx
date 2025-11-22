import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Loader2,
  PlusCircle,
  Save,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import api from "../lib/api.js";
import SpaCard from "../components/SpaCard.jsx";
import ServiceEditor from "../components/ServiceEditor.jsx";
import EmbedCode from "../components/EmbedCode.jsx";
import { Button } from "../components/ui/button.jsx";

const blankSpa = {
  spaId: "",
  spaName: "",
  botName: "Ava",
  botImage: null,
  offer: "",
  colors: { primary: "#8b5cf6", secondary: "#f5f3ff" },
  services: [],
  isActive: true,
};

const Spas = () => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSpa, setSelectedSpa] = useState(null);
  const [formState, setFormState] = useState(blankSpa);
  const [errorMessage, setErrorMessage] = useState(null);

  const { data: spas = [], isLoading } = useQuery({
    queryKey: ["spas"],
    queryFn: async () => {
      const { data } = await api.get("/spas");
      return data;
    },
  });

  const saveSpa = useMutation({
    mutationFn: async (payload) => {
      if (payload._id) {
        const { data } = await api.put(`/spas/${payload._id}`, payload);
        return data;
      }
      const { data } = await api.post("/spas", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["spas"]);
      setFormOpen(false);
      setFormState(blankSpa);
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error("Error saving spa:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to save spa";
      setErrorMessage(errorMsg);
      
      // Also log to console for debugging
      if (error.response?.status === 401) {
        setErrorMessage("Authentication failed. Please log in again.");
      } else if (error.response?.status === 400) {
        setErrorMessage(`Validation error: ${errorMsg}`);
      } else if (error.response?.status === 409) {
        setErrorMessage(`Spa ID already exists. Please use a different Spa ID.`);
      }
    },
  });

  const deleteSpa = useMutation({
    mutationFn: async (spa) => {
      await api.delete(`/spas/${spa._id}`);
    },
    onSuccess: () => queryClient.invalidateQueries(["spas"]),
  });

  const toggleSpa = useMutation({
    mutationFn: async (spa) => {
      const { data } = await api.put(`/spas/${spa._id}`, {
        ...spa,
        isActive: !spa.isActive,
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["spas"]),
  });

  const handleEdit = (spa) => {
    setFormState(spa);
    setFormOpen(true);
  };

  const handleNew = () => {
    setFormState(blankSpa);
    setFormOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Sanitize botImage: convert empty string to null before sending
    const sanitizedState = { ...formState };
    if (sanitizedState.botImage === "" || (sanitizedState.botImage && sanitizedState.botImage.trim() === "")) {
      sanitizedState.botImage = null;
    }
    saveSpa.mutate(sanitizedState);
  };

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold">Spas</p>
          <p className="text-sm text-slate-500">
            Manage configurations powering every chatbot
          </p>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <PlusCircle size={16} />
          Add Spa
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Loading spas...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spas.map((spa) => (
            <SpaCard
              key={spa._id}
              spa={spa}
              onToggle={() => toggleSpa.mutate(spa)}
              onEdit={handleEdit}
              onDelete={() => deleteSpa.mutate(spa)}
              onSelect={(spa) => setSelectedSpa(spa.spaId)}
            />
          ))}
        </div>
      )}

      <EmbedCode spaId={selectedSpa} />

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold">
                  {formState._id ? "Edit Spa" : "New Spa"}
                </p>
                <p className="text-sm text-slate-500">
                  Configure bot details, services, and styling
                </p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500"
              >
                <XCircle size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">Error saving spa:</p>
                  <p>{errorMessage}</p>
                  <p className="mt-2 text-xs">
                    Common issues: Not logged in, Spa ID already exists, or missing required fields.
                  </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Spa ID
                  </label>
                  <input
                    required
                    value={formState.spaId}
                    onChange={(e) => handleChange("spaId", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="aurum-andheri"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Spa Name
                  </label>
                  <input
                    required
                    value={formState.spaName}
                    onChange={(e) => handleChange("spaName", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="Aurum Spa - Andheri"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Bot Name
                  </label>
                  <input
                    value={formState.botName}
                    onChange={(e) => handleChange("botName", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Bot Image URL
                  </label>
                  <input
                    value={formState.botImage || ""}
                    onChange={(e) => handleChange("botImage", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="https://example.com/image.png or leave empty for default"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Offer Text
                  </label>
                  <input
                    value={formState.offer}
                    onChange={(e) => handleChange("offer", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={formState.colors.primary}
                      onChange={(e) =>
                        handleChange("colors", {
                          ...formState.colors,
                          primary: e.target.value,
                        })
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={formState.colors.secondary}
                      onChange={(e) =>
                        handleChange("colors", {
                          ...formState.colors,
                          secondary: e.target.value,
                        })
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <ServiceEditor
                services={formState.services}
                onChange={(services) => handleChange("services", services)}
              />

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                    formState.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <ShieldCheck size={16} />
                  {formState.isActive ? "Active" : "Inactive"}
                </span>
                <label className="text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Enable chatbot for this spa
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveSpa.isPending}
                  className="flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saveSpa.isPending ? "Saving..." : "Save Spa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spas;

