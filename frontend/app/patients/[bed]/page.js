"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Stethoscope,
  Plus,
  Activity,
} from "lucide-react";

const PatientPage = () => {
  const params = useParams();
  const { bed } = params;

  const [patient, setPatient] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [handovers, setHandovers] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient and handovers by bed
        const handoversRes = await fetch(
          `http://localhost:9090/api/patients/${bed}/handovers`,
        );
        const handoversData = await handoversRes.json();

        setPatient(handoversData.patient);
        setHandovers(handoversData.handovers || []);

        // Fetch AI summary if there are handovers
        if (handoversData.handovers && handoversData.handovers.length > 0) {
          const summaryRes = await fetch(
            `http://localhost:9090/api/patients/${bed}/summary`,
          );
          const summaryData = await summaryRes.json();
          setAiSummary(summaryData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [bed]);

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
            <p className="text-red-700">
              Error: Patient not found in bed {bed}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conditions = (() => {
    if (!patient.conditions) return [];
    if (Array.isArray(patient.conditions)) return patient.conditions;
    try {
      return JSON.parse(patient.conditions);
    } catch {
      return [];
    }
  })();

  const urgencyColors = {
    critical: "bg-red-100 border-red-400 border-l-4",
    urgent: "bg-yellow-100 border-yellow-400 border-l-4",
    routine: "bg-green-100 border-green-400 border-l-4",
  };

  const urgencyBadgeColors = {
    critical: "bg-red-200 text-red-800",
    urgent: "bg-yellow-200 text-yellow-800",
    routine: "bg-green-200 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <Link
          href={`/units/${patient.unit_id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Unit
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {patient.first_name} {patient.last_name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Bed Number</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.bed}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {patient.status}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(patient.date_of_birth).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />
                Conditions
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              AI Summary ({aiSummary.handover_count} handovers)
            </h2>
            <div className="text-gray-800 space-y-3">
              {aiSummary.ai_summary
                .replace(/##\s*/g, "")
                .replace(/\*\*SBAR\*\*/g, "")
                .replace(/\*\*([^*]+)\*\*/g, "$1")
                .split("\n")
                .map((line, index) => {
                  const labelMatch = line.match(/^([A-Z][a-z]+):\s*(.+)$/);
                  if (labelMatch) {
                    return (
                      <p key={index}>
                        <strong className="font-semibold text-gray-900">
                          {labelMatch[1]}:
                        </strong>{" "}
                        {labelMatch[2]}
                      </p>
                    );
                  }
                  return line.trim() ? <p key={index}>{line}</p> : null;
                })}
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              ⚠️ {aiSummary.disclaimer}
            </p>
          </div>
        )}

        {/* Handovers List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Handover Notes ({handovers.length})
          </h2>

          {handovers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No handovers for this patient
            </p>
          ) : (
            <div className="space-y-4">
              {handovers.map((handover) => (
                <div
                  key={handover.id}
                  className={`p-5 rounded-lg ${urgencyColors[handover.urgency]}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${urgencyBadgeColors[handover.urgency]}`}
                      >
                        {handover.urgency}
                      </span>
                      <p className="text-sm text-gray-700 mt-2">
                        📅{" "}
                        {new Date(handover.handover_date).toLocaleDateString(
                          "en-GB",
                        )}{" "}
                        -
                        <span className="capitalize ml-1 font-semibold">
                          {handover.shift}
                        </span>{" "}
                        shift
                        <br />
                        <span className="text-xs text-gray-600">
                          Nurse: {handover.nurse_name}
                        </span>
                      </p>
                    </div>

                    {handover.vitals && (
                      <div className="text-sm text-gray-700 bg-white bg-opacity-50 rounded p-2">
                        <p>
                          <strong>BP:</strong> {handover.vitals.bloodPressure}
                        </p>
                        <p>
                          <strong>HR:</strong> {handover.vitals.pulse} bpm
                        </p>
                        <p>
                          <strong>Temp:</strong> {handover.vitals.temperature}°C
                        </p>
                        <p>
                          <strong>RR:</strong> {handover.vitals.respiratoryRate}
                        </p>
                        <p>
                          <strong>O2:</strong>{" "}
                          {handover.vitals.oxygenSaturation}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-gray-800">
                    <p>{handover.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button with Menu */}
      <div className="fixed bottom-8 right-8 z-50">
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-2xl border-2 border-blue-400 py-2 mb-2 w-48 ring-4 ring-blue-100">
            <Link
              href={`/handovers/new?bed=${bed}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">New Handover</span>
            </Link>
            <Link
              href={`/vitals/new?bed=${bed}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Record Vitals</span>
            </Link>
          </div>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus
            className={`w-6 h-6 transition-transform ${showMenu ? "rotate-45" : ""}`}
          />
        </button>
      </div>

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PatientPage;
