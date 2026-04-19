"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewHandoverPage() {
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
    time: "",
    urgency: "routine",
    blood_pressure: "120/80",
    pulse: "75",
    temperature: "36.5",
    respiratory_rate: "16",
    oxygen_saturation: "98",
    content: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient by bed
        const patientRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${bed}/handovers`,
        );
        const patientData = await patientRes.json();
        setPatient(patientData.patient);

        // Fetch nurses
        const nursesRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/nurses");
        const nursesData = await nursesRes.json();
        setNurses(nursesData.nurses);
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        setFormData((prev) => ({ ...prev, time: currentTime }));
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
      const today = new Date().toISOString().split("T")[0];
      const handoverDateTime = `${today}T${formData.time}:00`;
      const handoverData = {
        nurse_id: parseInt(formData.nurse_id),
        patient_id: patient.id,
        handover_date: handoverDateTime,
        shift: formData.shift,
        urgency: formData.urgency,
        vitals: JSON.stringify(vitals),
        content: formData.content,
      };

      const response = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/handovers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(handoverData),
      });

      if (response.ok) {
        router.push(`/patients/${bed}`);
      } else {
        alert("Failed to create handover");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting handover:", err);
      alert("Error creating handover");
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
            Create Handover
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
            {/* Time field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="routine"
                    checked={formData.urgency === "routine"}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    className="mr-2"
                  />
                  Routine
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="urgent"
                    checked={formData.urgency === "urgent"}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    className="mr-2"
                  />
                  Urgent
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="critical"
                    checked={formData.urgency === "critical"}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    className="mr-2"
                  />
                  Critical
                </label>
              </div>
            </div>

            {/* Vitals Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vitals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="120"
                      value={formData.blood_pressure.split("/")[0]}
                      onChange={(e) => {
                        const systolic = e.target.value;
                        const diastolic =
                          formData.blood_pressure.split("/")[1] || "80";
                        setFormData({
                          ...formData,
                          blood_pressure: `${systolic}/${diastolic}`,
                        });
                      }}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 font-medium text-xl">/</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={formData.blood_pressure.split("/")[1]}
                      onChange={(e) => {
                        const systolic =
                          formData.blood_pressure.split("/")[0] || "120";
                        const diastolic = e.target.value;
                        setFormData({
                          ...formData,
                          blood_pressure: `${systolic}/${diastolic}`,
                        });
                      }}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
            </div>

            {/* Handover Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handover Notes *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
                rows={6}
                placeholder="Enter clinical notes, observations, changes in condition, interventions, and concerns..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Handover"}
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
