"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function UnitPage() {
  const params = useParams();
  const { id } = params;

  const [unit, setUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch unit details
        const unitRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`);
        const unitData = await unitRes.json();
        const foundUnit = unitData.units.find((u) => u.id === Number(id));
        setUnit(foundUnit);

        // Fetch patients in this unit
        const patientsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients?unit=${id}`,
        );
        const patientsData = await patientsRes.json();
        // Fetch all handovers to get urgency
        const handoversRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/handovers`);
        const handoversData = await handoversRes.json();

        // Add urgency from latest handover to each patient
        const patientsWithUrgency = (patientsData.patients || []).map(
          (patient) => {
            const patientHandovers = (handoversData.handovers || [])
              .filter((h) => h.patient_id === patient.id)
              .sort(
                (a, b) => new Date(b.handover_date) - new Date(a.handover_date),
              );

            const latestHandover = patientHandovers[0];
            return {
              ...patient,
              urgency: latestHandover?.urgency || "routine",
            };
          },
        );

        setPatients(patientsWithUrgency);
        setLoading(false);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-700">Error: Unit not found</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Units
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // Filter by search and urgency
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.bed.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUrgency =
      urgencyFilter === "all" || patient.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Units
        </Link>
      </div>

      {/* Unit Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {unit.name}
        </h1>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Patients ({patients.length})
          </h2>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or bed number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Urgency Filter Buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setUrgencyFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                urgencyFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUrgencyFilter("critical")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                urgencyFilter === "critical"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Critical (
              {patients.filter((p) => p.urgency === "critical").length})
            </button>
            <button
              onClick={() => setUrgencyFilter("urgent")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                urgencyFilter === "urgent"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              Urgent ({patients.filter((p) => p.urgency === "urgent").length})
            </button>
            <button
              onClick={() => setUrgencyFilter("routine")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                urgencyFilter === "routine"
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Routine ({patients.filter((p) => p.urgency === "routine").length})
            </button>
          </div>

          {filteredPatients.length === 0 ? (
            <p className="text-gray-500">No patients match your search</p>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.bed}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Bed: {patient.bed}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {patient.status}
                      </p>
                    </div>
                    {patient.urgency && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                          patient.urgency === "critical"
                            ? "bg-red-200 text-red-800"
                            : patient.urgency === "urgent"
                              ? "bg-orange-200 text-orange-800"
                              : "bg-green-200 text-green-800"
                        }`}
                      >
                        {patient.urgency}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
