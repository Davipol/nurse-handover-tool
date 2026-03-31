"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewVitalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bed = searchParams.get("bed");

  const [patient, setPatient] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nurse_id: "",
    shift: "day",
    blood_pressure: "",
    pulse: "",
    temperature: "",
    respiratory_rate: "",
    oxygen_saturation: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient by bed
        const patientRes = await fetch(
          `http://localhost:9090/api/patients/${bed}/handovers`,
        );
        const patientData = await patientRes.json();
        setPatient(patientData.patient);

        // Fetch nurses
        const nursesRes = await fetch("http://localhost:9090/api/nurses");
        const nursesData = await nursesRes.json();
        setNurses(nursesData.nurses);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    if (bed) {
      fetchData();
    }
  }, [bed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const vitals = {
        bloodPressure: formData.blood_pressure,
        pulse: parseInt(formData.pulse),
        temperature: parseFloat(formData.temperature),
        respiratoryRate: parseInt(formData.respiratory_rate),
        oxygenSaturation: parseInt(formData.oxygen_saturation),
      };

      const handoverData = {
        nurse_id: parseInt(formData.nurse_id),
        patient_id: patient.id,
        handover_date: new Date().toISOString().split("T")[0],
        shift: formData.shift,
        urgency: "routine",
        vitals: JSON.stringify(vitals),
        content: "Routine vitals measurement",
      };

      const response = await fetch("http://localhost:9090/api/handovers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(handoverData),
      });

      if (response.ok) {
        router.push(`/patients/${bed}`);
      } else {
        alert("Failed to record vitals");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting vitals:", err);
      alert("Error recording vitals");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-700">Patient not found</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <Link
          href={`/patients/${bed}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Record Vitals
          </h1>
          <p className="text-gray-600 mb-6">
            {patient.first_name} {patient.last_name} - Bed {patient.bed}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nurse Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nurse *
              </label>
              <select
                value={formData.nurse_id}
                onChange={(e) =>
                  setFormData({ ...formData, nurse_id: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a nurse</option>
                {nurses.map((nurse) => (
                  <option key={nurse.id} value={nurse.id}>
                    {nurse.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="day"
                    checked={formData.shift === "day"}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                    className="mr-2"
                  />
                  Day
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="night"
                    checked={formData.shift === "night"}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                    className="mr-2"
                  />
                  Night
                </label>
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure *
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.blood_pressure}
                  onChange={(e) =>
                    setFormData({ ...formData, blood_pressure: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pulse (bpm) *
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={formData.pulse}
                  onChange={(e) =>
                    setFormData({ ...formData, pulse: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respiratory Rate *
                </label>
                <input
                  type="number"
                  placeholder="16"
                  value={formData.respiratory_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      respiratory_rate: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O2 Saturation (%) *
                </label>
                <input
                  type="number"
                  placeholder="98"
                  value={formData.oxygen_saturation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oxygen_saturation: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? "Recording..." : "Record Vitals"}
              </button>
              <Link
                href={`/patients/${bed}`}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
